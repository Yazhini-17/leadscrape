import httpx
import asyncio
import re
import logging
from typing import Optional, Dict
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

logger = logging.getLogger(__name__)

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36 LeadScrape/1.0"
)

JS_INDICATORS = [
    "react", "angular", "vue", "next.js", "nuxt",
    "__NEXT_DATA__", "ng-app", "data-reactroot",
    "window.__INITIAL_STATE__",
]


class HTTPScraper:
    def __init__(self, timeout: int = 15, max_retries: int = 2):
        self.timeout = timeout
        self.max_retries = max_retries
        self.headers = {
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
        }

    async def fetch(self, url: str) -> Dict:
        last_error = None
        for attempt in range(self.max_retries + 1):
            try:
                async with httpx.AsyncClient(
                    headers=self.headers,
                    timeout=self.timeout,
                    follow_redirects=True,
                    verify=False,
                ) as client:
                    response = await client.get(url)
                    html = response.text
                    return {
                        "success": True,
                        "html": html,
                        "status_code": response.status_code,
                        "error": None,
                        "is_js_required": self.is_js_required(html),
                        "final_url": str(response.url),
                    }
            except httpx.TimeoutException:
                last_error = "TIMEOUT"
                logger.warning(f"Timeout fetching {url} (attempt {attempt + 1})")
            except httpx.HTTPStatusError as e:
                return {
                    "success": False,
                    "html": "",
                    "status_code": e.response.status_code,
                    "error": f"HTTP {e.response.status_code}",
                    "is_js_required": False,
                    "final_url": url,
                }
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Error fetching {url}: {e}")

            if attempt < self.max_retries:
                await asyncio.sleep(2 ** attempt)

        return {
            "success": False,
            "html": "",
            "status_code": None,
            "error": last_error,
            "is_js_required": False,
            "final_url": url,
        }

    def is_js_required(self, html: str) -> bool:
        if not html or len(html) < 200:
            return True
        html_lower = html.lower()
        js_count = sum(1 for indicator in JS_INDICATORS if indicator.lower() in html_lower)
        # Also check for very little text content
        text_content = re.sub(r"<[^>]+>", "", html)
        text_content = re.sub(r"\s+", " ", text_content).strip()
        if len(text_content) < 100 and js_count > 0:
            return True
        return js_count >= 3

    async def check_robots(self, url: str) -> bool:
        """Returns True if allowed to crawl."""
        try:
            parsed = urlparse(url)
            robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
            async with httpx.AsyncClient(timeout=5, verify=False) as client:
                resp = await client.get(robots_url)
                if resp.status_code == 200:
                    rp = RobotFileParser()
                    rp.parse(resp.text.splitlines())
                    return rp.can_fetch(USER_AGENT, url)
        except Exception:
            pass
        return True  # If robots.txt unavailable, assume allowed

    def is_access_denied(self, status_code: Optional[int], html: str) -> bool:
        if status_code in (401, 403, 429):
            return True
        if html:
            html_lower = html.lower()
            denied_signals = [
                "access denied", "403 forbidden", "blocked",
                "captcha", "verify you are human", "robot",
                "cloudflare", "please enable cookies",
            ]
            if any(sig in html_lower for sig in denied_signals):
                return True
        return False

    def has_login_form(self, html: str) -> bool:
        if not html:
            return False
        return bool(re.search(r'type=["\']password["\']', html, re.IGNORECASE))
