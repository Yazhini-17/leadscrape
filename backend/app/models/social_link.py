from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database.database import Base


class SocialLink(Base):
    __tablename__ = "social_links"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)

    platform = Column(String(30), nullable=False)  # FACEBOOK/INSTAGRAM/LINKEDIN/YOUTUBE/TWITTER/OTHER
    url = Column(Text, nullable=False)
    is_valid = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    organization = relationship("Organization", back_populates="social_links")
