import httpx
import asyncio
import re
import logging
from typing import List, Dict
from urllib.parse import quote_plus, urlparse
from bs4 import BeautifulSoup
from app.discovery.provider import DiscoveryProvider

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


class DuckDuckGoProvider(DiscoveryProvider):
    """Searches DuckDuckGo HTML for organizations matching keyword + location."""

    async def discover(self, keyword: str, location: str, max_results: int) -> List[Dict]:
        results = []
        query = f"{keyword} {location} official website"
        url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"

        try:
            async with httpx.AsyncClient(
                headers=HEADERS, timeout=20, follow_redirects=True, verify=False
            ) as client:
                resp = await client.get(url)
                if resp.status_code != 200:
                    logger.warning(f"DuckDuckGo returned {resp.status_code}")
                    return []

                soup = BeautifulSoup(resp.text, "lxml")
                result_divs = soup.select(".result__body")

                for div in result_divs[:max_results * 2]:
                    title_el = div.select_one(".result__title")
                    url_el = div.select_one(".result__url")
                    snippet_el = div.select_one(".result__snippet")

                    if not title_el:
                        continue

                    title = title_el.get_text().strip()
                    result_url = ""
                    if url_el:
                        result_url = url_el.get_text().strip()
                        if not result_url.startswith("http"):
                            result_url = "https://" + result_url

                    # Filter out irrelevant results (social media directories, etc.)
                    if _is_irrelevant_url(result_url):
                        continue

                    # Clean title to get org name
                    org_name = _clean_title(title)
                    if not org_name:
                        continue

                    results.append({
                        "name": org_name,
                        "website_url": result_url,
                        "source": "duckduckgo",
                        "confidence": 0.7,
                        "snippet": snippet_el.get_text().strip() if snippet_el else "",
                    })

                    if len(results) >= max_results:
                        break

                await asyncio.sleep(1)  # Rate limit

        except Exception as e:
            logger.error(f"DuckDuckGo search failed: {e}")

        return results


class BingProvider(DiscoveryProvider):
    """Fallback: searches Bing HTML for organizations."""

    async def discover(self, keyword: str, location: str, max_results: int) -> List[Dict]:
        results = []
        query = f"{keyword} {location}"
        url = f"https://www.bing.com/search?q={quote_plus(query)}&count=20"

        try:
            async with httpx.AsyncClient(
                headers=HEADERS, timeout=20, follow_redirects=True, verify=False
            ) as client:
                resp = await client.get(url)
                if resp.status_code != 200:
                    return []

                soup = BeautifulSoup(resp.text, "lxml")
                result_items = soup.select("li.b_algo")

                for item in result_items[:max_results * 2]:
                    title_el = item.select_one("h2 a")
                    if not title_el:
                        continue

                    title = title_el.get_text().strip()
                    href = title_el.get("href", "")

                    if _is_irrelevant_url(href):
                        continue

                    org_name = _clean_title(title)
                    if not org_name:
                        continue

                    results.append({
                        "name": org_name,
                        "website_url": href if href.startswith("http") else "",
                        "source": "bing",
                        "confidence": 0.65,
                    })

                    if len(results) >= max_results:
                        break

                await asyncio.sleep(1)

        except Exception as e:
            logger.error(f"Bing search failed: {e}")

        return results


class UserProvidedURLProvider(DiscoveryProvider):
    """Use user-provided URLs directly."""

    def __init__(self, urls: List[str]):
        self.urls = urls

    async def discover(self, keyword: str, location: str, max_results: int) -> List[Dict]:
        results = []
        for url in self.urls[:max_results]:
            domain = _extract_domain_name(url)
            results.append({
                "name": domain or url,
                "website_url": url,
                "source": "user_provided",
                "confidence": 0.9,
            })
        return results


# ─── Helpers ──────────────────────────────────────────────────────────────────

IRRELEVANT_DOMAINS = {
    "facebook.com", "instagram.com", "twitter.com", "x.com",
    "linkedin.com", "youtube.com", "wikipedia.org", "justdial.com",
    "sulekha.com", "indiamart.com", "quora.com", "reddit.com",
    "maps.google.com", "google.com", "yelp.com",
}


def _is_irrelevant_url(url: str) -> bool:
    if not url:
        return True
    try:
        domain = urlparse(url).netloc.replace("www.", "").lower()
        return any(irr in domain for irr in IRRELEVANT_DOMAINS)
    except Exception:
        return False


def _clean_title(title: str) -> str:
    """Extract org name from search result title."""
    title = re.sub(r"\s*[-|–]\s*.+$", "", title).strip()
    title = re.sub(r"\s+", " ", title)
    return title[:200] if title else ""


def _extract_domain_name(url: str) -> str:
    try:
        from urllib.parse import urlparse
        netloc = urlparse(url).netloc.replace("www.", "")
        return netloc.split(".")[0].replace("-", " ").replace("_", " ").title()
    except Exception:
        return ""
