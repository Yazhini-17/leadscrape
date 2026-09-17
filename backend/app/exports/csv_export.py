import csv
import io
from typing import List


def _get_first_phone(org, is_whatsapp=False):
    if not org.phone_numbers:
        return ""
    for p in org.phone_numbers:
        if p.is_whatsapp == is_whatsapp:
            return p.normalized or p.number
    return ""


def _get_alt_phone(org):
    main_found = False
    for p in org.phone_numbers:
        if not p.is_whatsapp:
            if main_found:
                return p.normalized or p.number
            main_found = True
    return ""


def _get_first_email(org):
    if org.email_addresses:
        return org.email_addresses[0].normalized or org.email_addresses[0].email
    return ""


def _get_website(org):
    if org.websites:
        for w in org.websites:
            if w.is_official:
                return w.url
        return org.websites[0].url
    return ""


def _get_social(org, platform):
    for sl in org.social_links:
        if sl.platform == platform:
            return sl.url
    return ""


def _get_contact_person(org):
    if org.contacts:
        return org.contacts[0].name
    return ""


def _get_designation(org):
    if org.contacts:
        return org.contacts[0].designation or ""
    return ""


def flatten_org(org) -> dict:
    created = org.created_at.strftime("%Y-%m-%d %H:%M") if org.created_at else ""
    return {
        "Organization Name": org.name or "",
        "Category": org.category or "",
        "Website": _get_website(org),
        "Phone": _get_first_phone(org, False),
        "Alternate Phone": _get_alt_phone(org),
        "Email": _get_first_email(org),
        "WhatsApp": _get_first_phone(org, True),
        "Address": org.address or "",
        "City": org.city or "",
        "State": org.state or "",
        "Pincode": org.pincode or "",
        "Contact Person": _get_contact_person(org),
        "Designation": _get_designation(org),
        "Facebook": _get_social(org, "FACEBOOK"),
        "Instagram": _get_social(org, "INSTAGRAM"),
        "LinkedIn": _get_social(org, "LINKEDIN"),
        "YouTube": _get_social(org, "YOUTUBE"),
        "Twitter": _get_social(org, "TWITTER"),
        "Confidence Score": org.confidence_score or 0,
        "Confidence Level": org.confidence_level or "LOW",
        "Phone Source": next((p.source_url for p in org.phone_numbers if p.source_url), ""),
        "Email Source": next((e.source_url for e in org.email_addresses if e.source_url), ""),
        "Address Source": org.address_source or "",
        "Scraped Date": created,
    }


FIELDNAMES = [
    "Organization Name", "Category", "Website", "Phone", "Alternate Phone",
    "Email", "WhatsApp", "Address", "City", "State", "Pincode",
    "Contact Person", "Designation", "Facebook", "Instagram", "LinkedIn",
    "YouTube", "Twitter", "Confidence Score", "Confidence Level",
    "Phone Source", "Email Source", "Address Source", "Scraped Date",
]


def generate_csv(organizations: list) -> str:
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=FIELDNAMES, extrasaction="ignore")
    writer.writeheader()
    for org in organizations:
        writer.writerow(flatten_org(org))
    return output.getvalue()
