import re
from typing import Optional


EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")
PHONE_REGEX_IN = re.compile(r"^(\+91[\s\-]?)?[6-9]\d{9}$")
PHONE_REGEX_LAND = re.compile(r"^0[2-9]\d{1,2}[\s\-]?\d{6,8}$")


def validate_email(email: str) -> bool:
    return bool(EMAIL_REGEX.match(email.strip()))


def validate_phone(phone: str) -> bool:
    digits = re.sub(r"[\s\-\(\)]", "", phone)
    return bool(PHONE_REGEX_IN.match(digits) or PHONE_REGEX_LAND.match(digits))


def validate_url(url: str) -> bool:
    return bool(re.match(r"^https?://[^\s/$.?#].[^\s]*$", url.strip()))


def normalize_phone(phone: str) -> str:
    """Normalize Indian phone number."""
    digits = re.sub(r"[^\d+]", "", phone)
    if digits.startswith("+91"):
        digits = digits[3:]
    elif digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    digits = digits.lstrip("0")
    if len(digits) == 10 and digits[0] in "6789":
        return "+91" + digits
    return phone


def normalize_email(email: str) -> str:
    return email.strip().lower()


def normalize_url(url: str) -> str:
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url.rstrip("/")
