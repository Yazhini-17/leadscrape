import re
from difflib import SequenceMatcher
from typing import List, Dict


STOPWORDS = {
    "the", "a", "an", "and", "or", "of", "in", "at", "to", "for",
    "school", "college", "academy", "institute", "international",
    "pvt", "ltd", "private", "limited", "inc", "co",
}


def normalize_name(name: str) -> str:
    """Normalize organization name for comparison."""
    name = name.lower().strip()
    name = re.sub(r"[^a-z0-9\s]", " ", name)
    words = [w for w in name.split() if w not in STOPWORDS and len(w) > 1]
    return " ".join(sorted(words))


def name_similarity(a: str, b: str) -> float:
    """Return similarity score between 0 and 1."""
    na, nb = normalize_name(a), normalize_name(b)
    if not na or not nb:
        return 0.0
    return SequenceMatcher(None, na, nb).ratio()


def deduplicate_organizations(discovered: List[Dict]) -> List[Dict]:
    """Remove duplicate organizations from discovery results."""
    unique = []
    seen_names = []
    seen_domains = set()

    for item in discovered:
        name = item.get("name", "")
        domain = _extract_domain(item.get("website_url", ""))

        # Check domain dedup
        if domain and domain in seen_domains:
            continue

        # Check name similarity
        is_dup = False
        for existing_name in seen_names:
            if name_similarity(name, existing_name) > 0.85:
                is_dup = True
                break

        if not is_dup:
            unique.append(item)
            seen_names.append(name)
            if domain:
                seen_domains.add(domain)

    return unique


def _extract_domain(url: str) -> str:
    if not url:
        return ""
    try:
        from urllib.parse import urlparse
        return urlparse(url).netloc.replace("www.", "").lower()
    except Exception:
        return ""
