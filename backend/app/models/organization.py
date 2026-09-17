from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, func, Text
from sqlalchemy.orm import relationship
from app.database.database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("scraping_tasks.id"), nullable=False)

    name = Column(String(500), nullable=False)
    category = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)

    # Address fields
    address = Column(Text, nullable=True)
    street = Column(String(500), nullable=True)
    area = Column(String(255), nullable=True)
    city = Column(String(255), nullable=True)
    state = Column(String(255), nullable=True)
    pincode = Column(String(10), nullable=True)
    address_source = Column(Text, nullable=True)

    # Confidence
    confidence_score = Column(Float, default=0.0)
    confidence_level = Column(String(10), default="LOW")  # LOW/MEDIUM/HIGH

    # Meta
    source = Column(String(255), nullable=True)
    is_duplicate = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    task = relationship("ScrapingTask", back_populates="organizations")
    websites = relationship("Website", back_populates="organization", cascade="all, delete-orphan")
    contacts = relationship("Contact", back_populates="organization", cascade="all, delete-orphan")
    phone_numbers = relationship("PhoneNumber", back_populates="organization", cascade="all, delete-orphan")
    email_addresses = relationship("EmailAddress", back_populates="organization", cascade="all, delete-orphan")
    social_links = relationship("SocialLink", back_populates="organization", cascade="all, delete-orphan")
    source_pages = relationship("SourcePage", back_populates="organization", cascade="all, delete-orphan")
    saved_by = relationship("SavedLead", back_populates="organization", cascade="all, delete-orphan")
