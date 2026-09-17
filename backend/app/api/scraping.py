from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.schemas.scraping import ScrapeRequest, ScrapeResponse
from app.core.security import get_current_user
from app.services.task_service import generate_task_id, update_task_status
from app.models.scraping_task import ScrapingTask
import json
import asyncio
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


def run_scraping_pipeline(task_db_id: int, task_id: str, request: ScrapeRequest):
    """Synchronous wrapper to run async scraping in background thread."""
    import asyncio
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(_async_scraping_pipeline(task_db_id, task_id, request))
    finally:
        loop.close()


async def _async_scraping_pipeline(task_db_id: int, task_id: str, request: ScrapeRequest):
    """Full async scraping pipeline."""
    from app.database.database import SessionLocal
    from app.discovery.search import DuckDuckGoProvider, BingProvider
    from app.discovery.provider import DiscoveryOrchestrator
    from app.scraper.crawler import WebsiteCrawler
    from app.scraper.cleaner import is_valid_phone, is_valid_email, deduplicate_phones, deduplicate_emails, deduplicate_social_links
    from app.services.deduplication import deduplicate_organizations
    from app.services.lead_service import calculate_confidence
    from app.models.organization import Organization
    from app.models.website import Website
    from app.models.phone_number import PhoneNumber
    from app.models.email_address import EmailAddress
    from app.models.contact import Contact
    from app.models.social_link import SocialLink
    from app.models.source_page import SourcePage
    from app.models.scraping_log import ScrapingLog
    from datetime import datetime

    db = SessionLocal()
    try:
        # Mark as RUNNING
        update_task_status(db, task_db_id, "RUNNING")
        logger.info(f"[{task_id}] Starting scraping pipeline for '{request.keyword}' in '{request.location}'")

        # Discovery
        providers = [DuckDuckGoProvider(), BingProvider()]
        orchestrator = DiscoveryOrchestrator(providers)
        discovered = await orchestrator.discover_all(
            request.keyword, request.location, request.max_results
        )
        logger.info(f"[{task_id}] Discovered {len(discovered)} candidates")

        # Deduplicate discovered orgs
        if request.enable_deduplication:
            discovered = deduplicate_organizations(discovered)

        # Update results_discovered counter
        task = db.query(ScrapingTask).filter(ScrapingTask.id == task_db_id).first()
        task.results_discovered = len(discovered)
        task.websites_found = sum(1 for d in discovered if d.get("website_url"))
        db.commit()

        crawler = WebsiteCrawler(task_id=task_id, db=db, settings_obj=None)

        for disc in discovered:
            if task.status == "CANCELLED":
                break

            org_name = disc.get("name", "Unknown")
            website_url = disc.get("website_url", "")

            # Create organization record
            org = Organization(
                task_id=task_db_id,
                name=org_name,
                category=request.keyword,
                location=request.location,
                source=disc.get("source", "search"),
            )
            db.add(org)
            db.commit()
            db.refresh(org)

            # Add website
            if website_url:
                website = Website(
                    organization_id=org.id,
                    url=website_url,
                    domain=_extract_domain(website_url),
                    is_official=True,
                    discovery_source=disc.get("source", "search"),
                    confidence=disc.get("confidence", 0.5),
                )
                db.add(website)
                db.commit()

            # Crawl website
            if website_url:
                log = ScrapingLog(task_id=task_db_id, url=website_url)
                db.add(log)
                db.commit()
                db.refresh(log)

                try:
                    crawl_result = await crawler.crawl_organization(
                        org_id=org.id,
                        website_url=website_url,
                        max_pages=request.max_pages_per_site,
                        required_fields=request.required_fields,
                        enable_javascript=request.enable_javascript,
                        respect_robots=request.respect_robots_txt,
                        crawl_internal=request.crawl_internal_pages,
                    )

                    # Save extracted phones
                    saved_phones = set()
                    for phone_data in deduplicate_phones(crawl_result.get("phones", [])):
                        norm = phone_data.get("normalized", phone_data["number"])
                        if norm not in saved_phones and is_valid_phone(phone_data["number"]):
                            pn = PhoneNumber(
                                organization_id=org.id,
                                number=phone_data["number"],
                                normalized=norm,
                                phone_type=phone_data.get("phone_type", "UNKNOWN"),
                                source_url=phone_data.get("source_url"),
                                is_whatsapp=phone_data.get("is_whatsapp", False),
                            )
                            db.add(pn)
                            saved_phones.add(norm)

                    # Save extracted emails
                    saved_emails = set()
                    for email_data in deduplicate_emails(crawl_result.get("emails", [])):
                        norm = email_data.get("normalized", email_data["email"]).lower()
                        if norm not in saved_emails and is_valid_email(email_data["email"]):
                            em = EmailAddress(
                                organization_id=org.id,
                                email=email_data["email"],
                                normalized=norm,
                                email_type=email_data.get("email_type", "GENERAL"),
                                source_url=email_data.get("source_url"),
                                is_valid=True,
                            )
                            db.add(em)
                            saved_emails.add(norm)

                    # Save address
                    addr = crawl_result.get("address")
                    if addr:
                        org.address = addr.get("address")
                        org.street = addr.get("street")
                        org.area = addr.get("area")
                        org.city = addr.get("city")
                        org.state = addr.get("state")
                        org.pincode = addr.get("pincode")
                        org.address_source = addr.get("source_url")

                    # Save contacts
                    for contact_data in crawl_result.get("contacts", []):
                        ct = Contact(
                            organization_id=org.id,
                            name=contact_data["name"],
                            designation=contact_data.get("designation"),
                            source_url=contact_data.get("source_url"),
                        )
                        db.add(ct)

                    # Save social links
                    saved_social = set()
                    for sl_data in deduplicate_social_links(crawl_result.get("social_links", [])):
                        if sl_data["url"] not in saved_social:
                            sl = SocialLink(
                                organization_id=org.id,
                                platform=sl_data["platform"],
                                url=sl_data["url"],
                                is_valid=True,
                            )
                            db.add(sl)
                            saved_social.add(sl_data["url"])

                    # Save source pages
                    for page_data in crawl_result.get("source_pages", []):
                        sp = SourcePage(
                            organization_id=org.id,
                            url=page_data["url"],
                            page_type=page_data.get("page_type"),
                            status_code=page_data.get("status_code"),
                            scraped_at=datetime.utcnow(),
                        )
                        db.add(sp)

                    db.commit()

                    # Update log
                    log.status = "SUCCESS"
                    log.pages_crawled = len(crawl_result.get("source_pages", []))
                    log.phones_extracted = len(saved_phones)
                    log.emails_extracted = len(saved_emails)

                    # Update task counters
                    task = db.query(ScrapingTask).filter(ScrapingTask.id == task_db_id).first()
                    task.websites_crawled += 1
                    if saved_phones:
                        task.phones_found += len(saved_phones)
                    if saved_emails:
                        task.emails_found += len(saved_emails)
                    if org.address:
                        task.addresses_found += 1
                    db.commit()

                except Exception as crawl_err:
                    logger.error(f"[{task_id}] Error crawling {website_url}: {crawl_err}")
                    log.status = "FAILED"
                    log.error_message = str(crawl_err)[:500]
                    db.commit()

            # Calculate and save confidence
            db.refresh(org)
            org.confidence_score, org.confidence_level = calculate_confidence(org)
            db.commit()

        # Mark completed
        task = db.query(ScrapingTask).filter(ScrapingTask.id == task_db_id).first()
        if task and task.status != "CANCELLED":
            task.status = "COMPLETED"
            task.completed_at = datetime.utcnow()
            db.commit()
            logger.info(f"[{task_id}] Scraping completed.")

    except Exception as e:
        logger.error(f"[{task_id}] Fatal error in scraping pipeline: {e}")
        try:
            task = db.query(ScrapingTask).filter(ScrapingTask.id == task_db_id).first()
            if task:
                task.status = "FAILED"
                task.error_message = str(e)[:500]
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


def _extract_domain(url: str) -> str:
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        return parsed.netloc.replace("www.", "")
    except Exception:
        return ""


@router.post("/scrape", response_model=ScrapeResponse, status_code=201)
async def create_scrape_task(
    request: ScrapeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task_id = generate_task_id(db)
    task = ScrapingTask(
        task_id=task_id,
        user_id=current_user.id,
        status="PENDING",
        location=request.location,
        keyword=request.keyword,
        search_radius=request.search_radius,
        max_results=request.max_results,
        max_pages_per_site=request.max_pages_per_site,
        required_fields=json.dumps(request.required_fields),
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    background_tasks.add_task(run_scraping_pipeline, task.id, task_id, request)

    return ScrapeResponse(task_id=task_id, status="PENDING")
