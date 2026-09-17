import re
from typing import List, Optional, Dict
from bs4 import BeautifulSoup


# ─── Phone Extraction ─────────────────────────────────────────────────────────

PHONE_PATTERNS = [
    re.compile(r"(?:\+91[\s\-]?)?[6-9]\d{9}"),
    re.compile(r"\+91[\s\-]?\d{5}[\s\-]?\d{5}"),
    re.compile(r"0[2-9]\d{1,2}[\s\-]?\d{6,8}"),
    re.compile(r"\d{4}[\s\-]\d{6}"),
]

WHATSAPP_HINTS = re.compile(r"whatsapp|wa\.me", re.IGNORECASE)


def extract_phones(html: str, source_url: str) -> List[Dict]:
    results = []
    seen = set()
    soup = BeautifulSoup(html, "lxml")

    # Tel links
    for a in soup.find_all("a", href=True):
        href = a.get("href", "")
        if href.startswith("tel:"):
            num = href.replace("tel:", "").strip()
            if num and num not in seen:
                is_wa = bool(WHATSAPP_HINTS.search(a.get_text() + str(a.parent)))
                results.append({
                    "number": num,
                    "normalized": _normalize_phone(num),
                    "phone_type": "WHATSAPP" if is_wa else "MAIN",
                    "source_url": source_url,
                    "is_whatsapp": is_wa,
                })
                seen.add(num)

    # WhatsApp links (wa.me)
    for a in soup.find_all("a", href=True):
        href = a.get("href", "")
        if "wa.me" in href:
            match = re.search(r"wa\.me/(\d+)", href)
            if match:
                num = match.group(1)
                if num not in seen:
                    results.append({
                        "number": "+" + num,
                        "normalized": "+" + num,
                        "phone_type": "WHATSAPP",
                        "source_url": source_url,
                        "is_whatsapp": True,
                    })
                    seen.add(num)

    # Text scan
    text = soup.get_text(" ")
    for pattern in PHONE_PATTERNS:
        for match in pattern.finditer(text):
            num = match.group().strip()
            clean = re.sub(r"[\s\-\(\)]", "", num)
            if clean not in seen and len(clean) >= 8:
                results.append({
                    "number": num,
                    "normalized": _normalize_phone(num),
                    "phone_type": "UNKNOWN",
                    "source_url": source_url,
                    "is_whatsapp": False,
                })
                seen.add(clean)

    return results


def _normalize_phone(phone: str) -> str:
    digits = re.sub(r"[^\d+]", "", phone)
    if digits.startswith("+91"):
        digits = digits[3:]
    elif digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    digits = digits.lstrip("0")
    if len(digits) == 10 and digits[0] in "6789":
        return "+91" + digits
    return phone


# ─── Email Extraction ──────────────────────────────────────────────────────────

EMAIL_PATTERN = re.compile(
    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", re.IGNORECASE
)
OBFUSCATED_EMAIL = re.compile(
    r"[a-zA-Z0-9._%+\-]+\s*[\[\(]?at[\]\)]?\s*[a-zA-Z0-9.\-]+\s*[\[\(]?dot[\]\)]?\s*[a-zA-Z]{2,}",
    re.IGNORECASE,
)
EMAIL_TYPE_MAP = {
    "info": "INFO", "contact": "CONTACT", "admin": "CONTACT",
    "admissions": "ADMISSIONS", "admission": "ADMISSIONS",
    "support": "SUPPORT", "help": "SUPPORT",
}


def extract_emails(html: str, source_url: str) -> List[Dict]:
    results = []
    seen = set()
    soup = BeautifulSoup(html, "lxml")

    # mailto links
    for a in soup.find_all("a", href=True):
        href = a.get("href", "")
        if href.startswith("mailto:"):
            email = href.replace("mailto:", "").split("?")[0].strip()
            if email and email not in seen:
                results.append({
                    "email": email,
                    "normalized": email.lower(),
                    "email_type": _classify_email(email),
                    "source_url": source_url,
                    "is_valid": True,
                })
                seen.add(email)

    # Text scan
    text = soup.get_text(" ")
    for match in EMAIL_PATTERN.finditer(text):
        email = match.group().strip()
        norm = email.lower()
        if norm not in seen and not email.endswith((".png", ".jpg", ".gif")):
            results.append({
                "email": email,
                "normalized": norm,
                "email_type": _classify_email(email),
                "source_url": source_url,
                "is_valid": True,
            })
            seen.add(norm)

    # Obfuscated
    for match in OBFUSCATED_EMAIL.finditer(text):
        raw = match.group()
        email = re.sub(r"\s*[\[\(]?at[\]\)]?\s*", "@", raw, flags=re.IGNORECASE)
        email = re.sub(r"\s*[\[\(]?dot[\]\)]?\s*", ".", email, flags=re.IGNORECASE).strip()
        norm = email.lower()
        if norm not in seen and "@" in email:
            results.append({
                "email": email,
                "normalized": norm,
                "email_type": _classify_email(email),
                "source_url": source_url,
                "is_valid": True,
            })
            seen.add(norm)

    return results


def _classify_email(email: str) -> str:
    local = email.split("@")[0].lower()
    for key, val in EMAIL_TYPE_MAP.items():
        if key in local:
            return val
    return "GENERAL"


# ─── Address Extraction ────────────────────────────────────────────────────────

PINCODE_PATTERN = re.compile(r"\b[1-9]\d{5}\b")
INDIAN_STATES = [
    "Tamil Nadu", "Karnataka", "Kerala", "Andhra Pradesh", "Telangana",
    "Maharashtra", "Gujarat", "Rajasthan", "Uttar Pradesh", "Madhya Pradesh",
    "West Bengal", "Bihar", "Punjab", "Haryana", "Odisha", "Assam",
    "Jharkhand", "Chhattisgarh", "Himachal Pradesh", "Uttarakhand",
    "Goa", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Tripura",
    "Arunachal Pradesh", "Sikkim", "Delhi", "Puducherry", "Chandigarh",
]
STATE_PATTERN = re.compile("|".join(re.escape(s) for s in INDIAN_STATES), re.IGNORECASE)


def extract_address(soup: BeautifulSoup, source_url: str) -> Optional[Dict]:
    # Try <address> tags first
    for tag in soup.find_all("address"):
        text = tag.get_text(" ").strip()
        if len(text) > 10:
            return _parse_address_text(text, source_url)

    # Try footer
    footer = soup.find("footer")
    if footer:
        text = footer.get_text(" ").strip()
        if len(text) > 10:
            parsed = _parse_address_text(text, source_url)
            if parsed and parsed.get("pincode"):
                return parsed

    # Try common contact section patterns
    for selector in [
        "div.contact", "div.address", "section.contact",
        "div[class*='contact']", "div[class*='address']", "div[class*='location']",
    ]:
        try:
            el = soup.select_one(selector)
            if el:
                text = el.get_text(" ").strip()
                parsed = _parse_address_text(text, source_url)
                if parsed and parsed.get("address"):
                    return parsed
        except Exception:
            pass

    return None


def _parse_address_text(text: str, source_url: str) -> Dict:
    result = {"address": text[:500], "source_url": source_url, "street": None,
              "area": None, "city": None, "state": None, "pincode": None}

    pincode = PINCODE_PATTERN.search(text)
    if pincode:
        result["pincode"] = pincode.group()

    state_match = STATE_PATTERN.search(text)
    if state_match:
        result["state"] = state_match.group()

    return result


# ─── Social Links ──────────────────────────────────────────────────────────────

SOCIAL_PLATFORMS = {
    "facebook.com": "FACEBOOK",
    "fb.com": "FACEBOOK",
    "instagram.com": "INSTAGRAM",
    "linkedin.com": "LINKEDIN",
    "youtube.com": "YOUTUBE",
    "youtu.be": "YOUTUBE",
    "twitter.com": "TWITTER",
    "x.com": "TWITTER",
}


def extract_social_links(soup: BeautifulSoup, source_url: str) -> List[Dict]:
    results = []
    seen = set()
    for a in soup.find_all("a", href=True):
        href = a.get("href", "").strip()
        for domain, platform in SOCIAL_PLATFORMS.items():
            if domain in href and href not in seen:
                if href.startswith("http"):
                    results.append({"platform": platform, "url": href, "source_url": source_url})
                    seen.add(href)
                break
    return results


# ─── Contact Person ────────────────────────────────────────────────────────────

DESIGNATION_KEYWORDS = [
    "Principal", "Director", "Founder", "Manager", "Administrator",
    "Chairman", "Correspondent", "Headmaster", "Headmistress",
    "Admissions Officer", "Secretary", "Trustee", "President",
    "CEO", "MD", "Managing Director",
]
DESIGNATION_PATTERN = re.compile(
    r"(" + "|".join(re.escape(d) for d in DESIGNATION_KEYWORDS) + r")[:\s]+([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})",
    re.IGNORECASE,
)


def extract_contact_persons(soup: BeautifulSoup, source_url: str) -> List[Dict]:
    results = []
    text = soup.get_text(" ")
    for match in DESIGNATION_PATTERN.finditer(text):
        designation = match.group(1).strip().title()
        name = match.group(2).strip()
        if name and len(name) > 3:
            results.append({"name": name, "designation": designation, "source_url": source_url})
    return results[:5]  # Limit to 5 per page


# ─── Page Type Detection ───────────────────────────────────────────────────────

PAGE_KEYWORDS = {
    "contact": ["contact", "reach us", "get in touch", "find us"],
    "about": ["about us", "about", "who we are", "our story"],
    "admissions": ["admissions", "admission", "enroll", "enrollment", "apply"],
    "management": ["management", "leadership", "board", "governance"],
    "faculty": ["faculty", "staff", "teachers", "team", "our team"],
    "branches": ["branches", "locations", "centers", "campus"],
}


def detect_page_type(url: str, title: str, content: str) -> str:
    url_lower = url.lower()
    combined = (title + " " + url_lower).lower()
    for page_type, keywords in PAGE_KEYWORDS.items():
        for kw in keywords:
            if kw in combined:
                return page_type
    return "other"
