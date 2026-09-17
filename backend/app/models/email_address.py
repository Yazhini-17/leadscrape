from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database.database import Base


class EmailAddress(Base):
    __tablename__ = "email_addresses"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)

    email = Column(String(255), nullable=False)
    normalized = Column(String(255), nullable=True)
    email_type = Column(String(20), default="GENERAL")  # INFO/CONTACT/ADMISSIONS/SUPPORT/GENERAL/UNKNOWN
    source_url = Column(Text, nullable=True)
    is_valid = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    organization = relationship("Organization", back_populates="email_addresses")
