from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database.database import Base


class PhoneNumber(Base):
    __tablename__ = "phone_numbers"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)

    number = Column(String(50), nullable=False)
    normalized = Column(String(50), nullable=True)
    phone_type = Column(String(20), default="UNKNOWN")  # MAIN/ALTERNATE/OFFICE/ADMISSIONS/LANDLINE/WHATSAPP/UNKNOWN
    source_url = Column(Text, nullable=True)
    is_whatsapp = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    organization = relationship("Organization", back_populates="phone_numbers")
