from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database.database import Base


class SourcePage(Base):
    __tablename__ = "source_pages"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)

    url = Column(Text, nullable=False)
    page_type = Column(String(50), nullable=True)  # home/about/contact/admissions/management/etc.
    status_code = Column(Integer, nullable=True)
    scraped_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    organization = relationship("Organization", back_populates="source_pages")
