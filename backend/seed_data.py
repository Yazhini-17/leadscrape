"""
LeadScrape — Dummy Data Seeder
Populates the database with a demo user, scraping tasks, organizations,
and full lead data (websites, contacts, phones, emails, socials, source
pages, logs, and saved leads) so the UI has something to show immediately.

Usage:
    python seed_data.py

Safe to re-run: it clears previously-seeded demo data (by task_id prefix
"DEMO") before inserting fresh rows, so it won't pile up duplicates.
"""

import json
import random
from datetime import datetime, timedelta

from app.database.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User
from app.models.scraping_task import ScrapingTask
from app.models.organization import Organization
from app.models.website import Website
from app.models.contact import Contact
from app.models.phone_number import PhoneNumber
from app.models.email_address import EmailAddress
from app.models.source_page import SourcePage
from app.models.social_link import SocialLink
from app.models.saved_lead import SavedLead
from app.models.scraping_log import ScrapingLog

DEMO_EMAIL = "demo@leadscrape.io"
DEMO_PASSWORD = "Demo1234!"

CITIES = ["Chennai", "Coimbatore", "Madurai", "Bengaluru", "Hyderabad"]
KEYWORDS = ["dental clinics", "law firms", "gyms", "coworking spaces", "cafes"]
NAME_STEMS = [
    "Sunrise", "Bluewave", "Prime", "Urban", "Apex", "Golden", "Silver",
    "Metro", "Skyline", "Everest", "Horizon", "Crescent", "Pinnacle",
    "Evergreen", "Bright", "Northstar",
]
NAME_SUFFIXES = [
    "Dental Care", "Law Associates", "Fitness Studio", "Coworks", "Cafe",
    "Consultants", "Clinic", "Workspace", "Legal Partners", "Wellness Center",
]
DOMAINS = [
    "sunrisedental.in", "bluewavelaw.com", "primefitness.co.in",
    "urbanworkspace.in", "apexcafe.com", "goldenlegal.in",
    "metroclinic.co.in", "skylinecoworks.com", "everestwellness.in",
]
PHONE_TYPES = ["MAIN", "ALTERNATE", "OFFICE", "WHATSAPP"]
EMAIL_TYPES = ["INFO", "CONTACT", "SUPPORT", "GENERAL"]
SOCIAL_PLATFORMS = ["FACEBOOK", "INSTAGRAM", "LINKEDIN"]
PAGE_TYPES = ["home", "about", "contact"]
FIRST_NAMES = ["Priya", "Arjun", "Kavya", "Rahul", "Sneha", "Vikram", "Divya", "Karthik"]
DESIGNATIONS = ["Founder", "Manager", "Director", "Owner", "Admin Head"]


def rand_phone():
    return f"+91 {random.randint(70000, 99999)}{random.randint(10000, 99999)}"


def rand_pincode():
    return str(random.randint(600001, 641050))


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("LeadScrape — Seeding dummy data...")

        # --- Clean up any previous demo data (idempotent re-run) ---
        old_user = db.query(User).filter(User.email == DEMO_EMAIL).first()
        if old_user:
            db.query(SavedLead).filter(SavedLead.user_id == old_user.id).delete()
            old_tasks = db.query(ScrapingTask).filter(ScrapingTask.user_id == old_user.id).all()
            for t in old_tasks:
                org_ids = [o.id for o in db.query(Organization).filter(Organization.task_id == t.id)]
                if org_ids:
                    db.query(Website).filter(Website.organization_id.in_(org_ids)).delete(synchronize_session=False)
                    db.query(Contact).filter(Contact.organization_id.in_(org_ids)).delete(synchronize_session=False)
                    db.query(PhoneNumber).filter(PhoneNumber.organization_id.in_(org_ids)).delete(synchronize_session=False)
                    db.query(EmailAddress).filter(EmailAddress.organization_id.in_(org_ids)).delete(synchronize_session=False)
                    db.query(SourcePage).filter(SourcePage.organization_id.in_(org_ids)).delete(synchronize_session=False)
                    db.query(SocialLink).filter(SocialLink.organization_id.in_(org_ids)).delete(synchronize_session=False)
                db.query(Organization).filter(Organization.task_id == t.id).delete(synchronize_session=False)
                db.query(ScrapingLog).filter(ScrapingLog.task_id == t.id).delete(synchronize_session=False)
            db.query(ScrapingTask).filter(ScrapingTask.user_id == old_user.id).delete(synchronize_session=False)
            db.commit()

        # --- Demo user ---
        user = db.query(User).filter(User.email == DEMO_EMAIL).first()
        if not user:
            user = User(
                email=DEMO_EMAIL,
                full_name="Demo User",
                hashed_password=hash_password(DEMO_PASSWORD),
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        name_pool = [f"{s} {x}" for s in NAME_STEMS for x in NAME_SUFFIXES]
        random.shuffle(name_pool)
        name_iter = iter(name_pool)

        task_defs = [
            ("COMPLETED", 40),
            ("COMPLETED", 25),
            ("RUNNING", 12),
            ("FAILED", 3),
            ("PENDING", 0),
        ]

        total_orgs = 0
        for i, (status, org_count) in enumerate(task_defs):
            city = CITIES[i % len(CITIES)]
            keyword = KEYWORDS[i % len(KEYWORDS)]
            created = datetime.utcnow() - timedelta(days=(len(task_defs) - i) * 2)

            task = ScrapingTask(
                task_id=f"DEMO{i+1:03d}",
                user_id=user.id,
                status=status,
                location=city,
                keyword=keyword,
                search_radius=15,
                max_results=100,
                max_pages_per_site=20,
                required_fields=json.dumps(["phone", "email"]),
                results_discovered=org_count + random.randint(0, 5),
                websites_found=org_count,
                websites_crawled=org_count if status == "COMPLETED" else max(org_count - 3, 0),
                phones_found=org_count * 2,
                emails_found=int(org_count * 1.5),
                addresses_found=org_count,
                duplicates_removed=random.randint(0, 4),
                error_message="Timed out contacting 3 sites after repeated retries." if status == "FAILED" else None,
                created_at=created,
                updated_at=created,
                completed_at=created + timedelta(minutes=18) if status in ("COMPLETED", "FAILED") else None,
            )
            db.add(task)
            db.commit()
            db.refresh(task)

            db.add(ScrapingLog(
                task_id=task.id,
                url=f"https://www.google.com/search?q={keyword.replace(' ', '+')}+{city.lower()}",
                status="SUCCESS" if status != "FAILED" else "FAILED",
                pages_crawled=org_count,
                phones_extracted=org_count * 2,
                emails_extracted=int(org_count * 1.5),
                error_message=None if status != "FAILED" else "Connection reset by peer",
            ))

            for j in range(org_count):
                try:
                    org_name = next(name_iter)
                except StopIteration:
                    name_iter = iter(name_pool)
                    org_name = next(name_iter)

                domain = DOMAINS[(total_orgs) % len(DOMAINS)]
                score = round(random.uniform(0.35, 0.98), 2)
                level = "HIGH" if score >= 0.75 else ("MEDIUM" if score >= 0.5 else "LOW")

                org = Organization(
                    task_id=task.id,
                    name=org_name,
                    category=keyword.title(),
                    location=city,
                    address=f"{random.randint(1,199)}, {random.choice(['Anna Nagar','MG Road','Velachery','T Nagar','Indiranagar'])}, {city}",
                    street=f"{random.randint(1,199)} Main Road",
                    area=random.choice(["Anna Nagar", "MG Road", "Velachery", "T Nagar", "Indiranagar"]),
                    city=city,
                    state="Tamil Nadu" if city in ("Chennai", "Coimbatore", "Madurai") else "Karnataka",
                    pincode=rand_pincode(),
                    address_source="contact_page",
                    confidence_score=score,
                    confidence_level=level,
                    source="google_search",
                    is_duplicate=False,
                )
                db.add(org)
                db.commit()
                db.refresh(org)
                total_orgs += 1

                db.add(Website(
                    organization_id=org.id,
                    url=f"https://www.{domain}",
                    domain=domain,
                    is_official=True,
                    discovery_source="google_search",
                    confidence=score,
                    status="ACTIVE",
                ))

                for _ in range(random.randint(1, 2)):
                    db.add(Contact(
                        organization_id=org.id,
                        name=random.choice(FIRST_NAMES) + " " + random.choice(["Kumar", "Rao", "Nair", "Sharma", "Iyer"]),
                        designation=random.choice(DESIGNATIONS),
                        source_url=f"https://www.{domain}/about",
                    ))

                for _ in range(random.randint(1, 2)):
                    num = rand_phone()
                    db.add(PhoneNumber(
                        organization_id=org.id,
                        number=num,
                        normalized=num.replace(" ", ""),
                        phone_type=random.choice(PHONE_TYPES),
                        source_url=f"https://www.{domain}/contact",
                        is_whatsapp=random.random() > 0.6,
                    ))

                email_local = org_name.lower().replace(" ", "")[:20]
                db.add(EmailAddress(
                    organization_id=org.id,
                    email=f"{email_local}@{domain}",
                    normalized=f"{email_local}@{domain}",
                    email_type=random.choice(EMAIL_TYPES),
                    source_url=f"https://www.{domain}/contact",
                    is_valid=True,
                ))

                for pt in random.sample(PAGE_TYPES, k=random.randint(1, 3)):
                    db.add(SourcePage(
                        organization_id=org.id,
                        url=f"https://www.{domain}/{pt if pt != 'home' else ''}",
                        page_type=pt,
                        status_code=200,
                        scraped_at=created,
                    ))

                for plat in random.sample(SOCIAL_PLATFORMS, k=random.randint(0, 2)):
                    db.add(SocialLink(
                        organization_id=org.id,
                        platform=plat,
                        url=f"https://{plat.lower()}.com/{email_local}",
                        is_valid=True,
                    ))

                db.commit()

        # --- Save a handful of leads to "Saved Leads" ---
        all_orgs = db.query(Organization).join(ScrapingTask).filter(ScrapingTask.user_id == user.id).all()
        for org in random.sample(all_orgs, k=min(5, len(all_orgs))):
            db.add(SavedLead(
                user_id=user.id,
                organization_id=org.id,
                notes="Follow up next week — looked promising on first pass.",
            ))
        db.commit()

        print("✓ Dummy data seeded successfully.")
        print(f"\nDemo login:\n  email:    {DEMO_EMAIL}\n  password: {DEMO_PASSWORD}")
        print(f"\nCreated:")
        print(f"  - 1 demo user")
        print(f"  - {len(task_defs)} scraping tasks (various statuses)")
        print(f"  - {total_orgs} organizations with websites, contacts, phones, emails, source pages, and socials")
        print(f"  - 5 saved leads")

    except Exception as e:
        db.rollback()
        print(f"✗ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
