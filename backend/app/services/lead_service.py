from typing import Set, Tuple
from app.models.organization import Organization
from app.schemas.lead import LeadListItem


def calculate_confidence(org: Organization) -> Tuple[float, str]:
    """Calculate confidence score for an organization."""
    score = 0.0

    # Website: 20 points
    if org.websites and any(w.status == "ACTIVE" for w in org.websites):
        score += 20

    # Phone: 20 points
    if org.phone_numbers and len(org.phone_numbers) > 0:
        score += 20

    # Email: 20 points
    if org.email_addresses and len(org.email_addresses) > 0:
        score += 20

    # Address: 20 points
    if org.address or org.city:
        score += 20

    # Contact Person: 10 points
    if org.contacts and len(org.contacts) > 0:
        score += 10

    # Social Links: 10 points
    if org.social_links and len(org.social_links) > 0:
        score += 10

    # Determine level
    if score >= 80:
        level = "HIGH"
    elif score >= 50:
        level = "MEDIUM"
    else:
        level = "LOW"

    return score, level


def build_lead_list_item(org: Organization, saved_ids: Set[int] = None) -> LeadListItem:
    """Build a flat LeadListItem from an Organization ORM object."""
    main_phone = None
    main_whatsapp = None
    if org.phone_numbers:
        for p in org.phone_numbers:
            if p.is_whatsapp and not main_whatsapp:
                main_whatsapp = p.normalized or p.number
            if not p.is_whatsapp and not main_phone:
                main_phone = p.normalized or p.number

    main_email = None
    if org.email_addresses:
        main_email = org.email_addresses[0].email

    main_website = None
    if org.websites:
        for w in org.websites:
            if w.is_official:
                main_website = w.url
                break
        if not main_website:
            main_website = org.websites[0].url

    contact_person = None
    if org.contacts:
        contact_person = org.contacts[0].name

    return LeadListItem(
        id=org.id,
        name=org.name,
        category=org.category,
        location=org.location,
        city=org.city,
        state=org.state,
        confidence_score=org.confidence_score or 0.0,
        confidence_level=org.confidence_level or "LOW",
        is_saved=(saved_ids is not None and org.id in saved_ids),
        created_at=org.created_at,
        main_phone=main_phone,
        main_email=main_email,
        main_website=main_website,
        main_whatsapp=main_whatsapp,
        contact_person=contact_person,
    )
