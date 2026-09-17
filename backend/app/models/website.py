from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database.database import Base


class Website(Base):
    __tablename__ = "websites"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)

    url = Column(Text, nullable=False)
    domain = Column(String(255), nullable=True)
    is_official = Column(Boolean, default=False)
    discovery_source = Column(String(255), nullable=True)
    confidence = Column(Float, default=0.0)
    status = Column(String(20), default="ACTIVE")  # ACTIVE/FAILED/BLOCKED/TIMEOUT
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    organization = relationship("Organization", back_populates="websites")
