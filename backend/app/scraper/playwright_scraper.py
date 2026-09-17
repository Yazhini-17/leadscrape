import logging
from typing import Dict

logger = logging.getLogger(__name__)


class PlaywrightScraper:
    """JavaScript rendering scraper using Playwright."""

    async def fetch(self, url: str, timeout: int = 30) -> Dict:
        try:
            from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent=(
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/120.0.0.0 Safari/537.36 LeadScrape/1.0"
                    ),
                    viewport={"width": 1280, "height": 800},
                )
                page = await context.new_page()
                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=timeout * 1000)
                    # Wait a bit for JS to settle
                    await page.wait_for_timeout(2000)
                    html = await page.content()
                    await browser.close()
                    return {"success": True, "html": html, "error": None}
                except PlaywrightTimeout:
                    await browser.close()
                    return {"success": False, "html": "", "error": "TIMEOUT"}
                except Exception as e:
                    await browser.close()
                    return {"success": False, "html": "", "error": str(e)}
        except ImportError:
            logger.warning("Playwright not installed. Install with: playwright install chromium")
            return {"success": False, "html": "", "error": "Playwright not installed"}
        except Exception as e:
            logger.error(f"Playwright error for {url}: {e}")
            return {"success": False, "html": "", "error": str(e)}
