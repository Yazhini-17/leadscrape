from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PhoneOut(BaseModel):
    id: int
    number: str
    normalized: Optional[str] = None
    phone_type: str
    source_url: Optional[str] = None
    is_whatsapp: bool

    model_config = {"from_attributes": True}


class EmailOut(BaseModel):
    id: int
    email: str
    normalized: Optional[str] = None
    email_type: str
    source_url: Optional[str] = None
    is_valid: bool

    model_config = {"from_attributes": True}


class ContactOut(BaseModel):
    id: int
    name: str
    designation: Optional[str] = None
    source_url: Optional[str] = None

    model_config = {"from_attributes": True}


class SocialLinkOut(BaseModel):
    id: int
    platform: str
    url: str
    is_valid: bool

    model_config = {"from_attributes": True}


class WebsiteOut(BaseModel):
    id: int
    url: str
    domain: Optional[str] = None
    is_official: bool
    status: str

    model_config = {"from_attributes": True}


class SourcePageOut(BaseModel):
    id: int
    url: str
    page_type: Optional[str] = None
    status_code: Optional[int] = None
    scraped_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class OrganizationOut(BaseModel):
    id: int
    name: str
    category: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    street: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    address_source: Optional[str] = None
    confidence_score: float
    confidence_level: str
    source: Optional[str] = None
    is_duplicate: bool
    created_at: Optional[datetime] = None

    phone_numbers: List[PhoneOut] = []
    email_addresses: List[EmailOut] = []
    contacts: List[ContactOut] = []
    social_links: List[SocialLinkOut] = []
    websites: List[WebsiteOut] = []
    source_pages: List[SourcePageOut] = []

    model_config = {"from_attributes": True}


class LeadListItem(BaseModel):
    id: int
    name: str
    category: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    confidence_score: float
    confidence_level: str
    is_saved: bool = False
    created_at: Optional[datetime] = None
    main_phone: Optional[str] = None
    main_email: Optional[str] = None
    main_website: Optional[str] = None
    main_whatsapp: Optional[str] = None
    contact_person: Optional[str] = None

    model_config = {"from_attributes": True}


class LeadListResponse(BaseModel):
    leads: List[LeadListItem]
    total: int
    page: int
    per_page: int
    pages: int


class SavedLeadOut(BaseModel):
    id: int
    organization_id: int
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    organization: Optional[LeadListItem] = None

    model_config = {"from_attributes": True}
