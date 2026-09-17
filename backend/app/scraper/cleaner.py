import re
from typing import List, Dict, Optional


def clean_text(text: str) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()


def clean_phone(phone: str) -> str:
    return re.sub(r"[^\d+\s\-\(\)]", "", phone).strip()


def clean_email(email: str) -> str:
    return email.strip().lower()


def clean_url(url: str) -> str:
    url = url.strip()
    if url and not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url.rstrip("/")


def is_valid_phone(phone: str) -> bool:
    if not phone:
        return False
    digits = re.sub(r"[^\d]", "", phone)
    # Must have 10 digits (Indian mobile) or more for landlines
    return 8 <= len(digits) <= 15


def is_valid_email(email: str) -> bool:
    if not email:
        return False
    pattern = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")
    return bool(pattern.match(email.strip()))


def deduplicate_phones(phones: List[Dict]) -> List[Dict]:
    seen = set()
    unique = []
    for p in phones:
        norm = re.sub(r"[^\d]", "", p.get("normalized") or p.get("number", ""))
        if norm not in seen and len(norm) >= 8:
            seen.add(norm)
            unique.append(p)
    return unique


def deduplicate_emails(emails: List[Dict]) -> List[Dict]:
    seen = set()
    unique = []
    for e in emails:
        norm = (e.get("normalized") or e.get("email", "")).lower()
        if norm not in seen:
            seen.add(norm)
            unique.append(e)
    return unique


def deduplicate_social_links(links: List[Dict]) -> List[Dict]:
    seen = set()
    unique = []
    for link in links:
        url = link.get("url", "")
        if url not in seen:
            seen.add(url)
            unique.append(link)
    return unique


def empty_to_none(value: Optional[str]) -> Optional[str]:
    if value is None or value.strip() == "":
        return None
    return value
