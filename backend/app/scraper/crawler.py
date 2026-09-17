import asyncio
import logging
import time
from typing import Dict, List, Optional
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup

from app.scraper.http_scraper import HTTPScraper
from app.scraper.playwright_scraper import PlaywrightScraper
from app.scraper.extractor import (
    extract_phones, extract_emails, extract_address,
    extract_social_links, extract_contact_persons, detect_page_type,
)

logger = logging.getLogger(__name__)

RELEVANT_PAGE_KEYWORDS = [
    "about", "contact", "reach", "admissions", "admission",
    "management", "principal", "faculty", "staff", "administration",
    "branches", "locations", "infrastructure", "team", "leadership",
]


class WebsiteCrawler:
    def __init__(self, task_id: str, db=None, settings_obj=None):
        self.task_id = task_id
        self.db = db
        self.http = HTTPScraper(timeout=15, max_retries=2)
        self.playwright = PlaywrightScraper()
        self.visited_urls: set = set()
        self.domain_last_request: Dict[str, float] = {}
        self.rate_limit = 2.0  # seconds between requests per domain

    async def crawl_organization(
        self,
        org_id: int,
        website_url: str,
        max_pages: int = 20,
        required_fields: List[str] = None,
        enable_javascript: bool = False,
        respect_robots: bool = True,
        crawl_internal: bool = True,
    ) -> Dict:
        """Main entry point — crawl one organization's website."""
        result = {
            "phones": [], "emails": [], "address": None,
            "contacts": [], "social_links": [], "source_pages": [],
        }

        if not website_url:
            return result

        domain = self._extract_domain(website_url)

        # robots.txt check
        if respect_robots:
            allowed = await self.http.check_robots(website_url)
            if not allowed:
                logger.info(f"[{self.task_id}] robots.txt disallows: {website_url}")
                return result

        # Fetch homepage
        html, status_code, final_url = await self._fetch_with_fallback(
            website_url, enable_javascript
        )
        if not html:
            return result

        # Check access denied
        if self.http.is_access_denied(status_code, html):
            logger.warning(f"[{self.task_id}] Access denied: {website_url}")
            return result

        # Track source page
        soup = BeautifulSoup(html, "lxml")
        result["source_pages"].append({
            "url": final_url or website_url,
            "page_type": "home",
            "status_code": status_code,
        })
        self.visited_urls.add(website_url)

        # Extract from homepage
        self._extract_and_merge(result, html, soup, final_url or website_url)

        # Find internal relevant pages
        if crawl_internal:
            internal_urls = self.discover_relevant_pages(website_url, soup)
            pages_crawled = 1

            for page_url in internal_urls:
                if pages_crawled >= max_pages:
                    break
                if page_url in self.visited_urls:
                    continue
                self.visited_urls.add(page_url)

                await self.rate_limit_domain(domain)

                page_html, page_status, page_final = await self._fetch_with_fallback(
                    page_url, enable_javascript
                )
                if not page_html:
                    continue

                if self.http.is_access_denied(page_status, page_html):
                    break  # Stop crawling this domain

                page_soup = BeautifulSoup(page_html, "lxml")
                page_type = detect_page_type(page_url, page_soup.title.string if page_soup.title else "", page_html)

                result["source_pages"].append({
                    "url": page_final or page_url,
                    "page_type": page_type,
                    "status_code": page_status,
                })

                self._extract_and_merge(result, page_html, page_soup, page_final or page_url)
                pages_crawled += 1
                logger.info(f"[{self.task_id}] Crawled page {pages_crawled}: {page_url}")

        return result

    async def _fetch_with_fallback(self, url: str, enable_js: bool) -> tuple:
        """Fetch URL with HTTP scraper, fall back to Playwright if needed."""
        response = await self.http.fetch(url)
        if response["success"]:
            html = response["html"]
            if enable_js and response.get("is_js_required"):
                logger.info(f"[{self.task_id}] JS required, using Playwright: {url}")
                pw_resp = await self.playwright.fetch(url)
                if pw_resp["success"]:
                    return pw_resp["html"], 200, url
            return html, response.get("status_code"), response.get("final_url", url)
        return "", response.get("status_code"), url

    def _extract_and_merge(self, result: Dict, html: str, soup: BeautifulSoup, source_url: str):
        """Extract data from page and merge into result."""
        phones = extract_phones(html, source_url)
        emails = extract_emails(html, source_url)
        address = extract_address(soup, source_url)
        social = extract_social_links(soup, source_url)
        contacts = extract_contact_persons(soup, source_url)

        result["phones"].extend(phones)
        result["emails"].extend(emails)
        result["social_links"].extend(social)
        result["contacts"].extend(contacts)

        if address and not result["address"]:
            result["address"] = address
        elif address and address.get("pincode") and not result["address"].get("pincode"):
            result["address"] = address

    def discover_relevant_pages(self, base_url: str, soup: BeautifulSoup) -> List[str]:
        """Find relevant internal page URLs from homepage."""
        base_domain = self._extract_domain(base_url)
        relevant = []
        priority_links = []
        other_links = []

        for a in soup.find_all("a", href=True):
            href = a.get("href", "").strip()
            if not href or href.startswith(("#", "javascript:", "mailto:", "tel:")):
                continue

            full_url = urljoin(base_url, href)
            link_domain = self._extract_domain(full_url)

            # Only internal links
            if link_domain != base_domain:
                continue

            anchor_text = a.get_text().strip().lower()
            url_lower = full_url.lower()

            is_relevant = any(
                kw in anchor_text or kw in url_lower
                for kw in RELEVANT_PAGE_KEYWORDS
            )

            if is_relevant:
                priority_links.append(full_url)
            else:
                other_links.append(full_url)

        # Deduplicate
        seen = {base_url}
        for url in priority_links + other_links:
            if url not in seen:
                relevant.append(url)
                seen.add(url)

        return relevant[:30]  # Max 30 candidate pages

    async def rate_limit_domain(self, domain: str):
        """Enforce domain-level rate limiting."""
        last = self.domain_last_request.get(domain, 0)
        elapsed = time.time() - last
        if elapsed < self.rate_limit:
            await asyncio.sleep(self.rate_limit - elapsed)
        self.domain_last_request[domain] = time.time()

    def _extract_domain(self, url: str) -> str:
        try:
            return urlparse(url).netloc.replace("www.", "").lower()
        except Exception:
            return ""
