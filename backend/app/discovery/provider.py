from abc import ABC, abstractmethod
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)


class DiscoveryProvider(ABC):
    """Base class for all discovery providers."""

    @abstractmethod
    async def discover(self, keyword: str, location: str, max_results: int) -> List[Dict]:
        """
        Returns list of dicts: {name, website_url, source, confidence}
        """
        pass


class DiscoveryOrchestrator:
    """Runs multiple providers and merges results."""

    def __init__(self, providers: List[DiscoveryProvider]):
        self.providers = providers

    async def discover_all(self, keyword: str, location: str, max_results: int) -> List[Dict]:
        all_results: List[Dict] = []
        seen_domains: set = set()

        for provider in self.providers:
            if len(all_results) >= max_results:
                break
            try:
                results = await provider.discover(keyword, location, max_results - len(all_results))
                for r in results:
                    domain = _extract_domain(r.get("website_url", ""))
                    if domain and domain in seen_domains:
                        continue
                    all_results.append(r)
                    if domain:
                        seen_domains.add(domain)
                    if len(all_results) >= max_results:
                        break
                logger.info(f"Provider {provider.__class__.__name__} returned {len(results)} results")
            except Exception as e:
                logger.error(f"Provider {provider.__class__.__name__} failed: {e}")

        return all_results[:max_results]


def _extract_domain(url: str) -> str:
    if not url:
        return ""
    try:
        from urllib.parse import urlparse
        return urlparse(url).netloc.replace("www.", "").lower()
    except Exception:
        return ""
