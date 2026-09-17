from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from app.database.database import Base


class ScrapingTask(Base):
    __tablename__ = "scraping_tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String(20), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="PENDING")  # PENDING/RUNNING/COMPLETED/FAILED/CANCELLED

    location = Column(String(255), nullable=False)
    keyword = Column(String(255), nullable=False)
    search_radius = Column(Integer, default=10)
    max_results = Column(Integer, default=100)
    max_pages_per_site = Column(Integer, default=20)
    required_fields = Column(Text, default="[]")  # JSON string

    # Progress counters
    results_discovered = Column(Integer, default=0)
    websites_found = Column(Integer, default=0)
    websites_crawled = Column(Integer, default=0)
    phones_found = Column(Integer, default=0)
    emails_found = Column(Integer, default=0)
    addresses_found = Column(Integer, default=0)
    duplicates_removed = Column(Integer, default=0)

    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="tasks")
    organizations = relationship("Organization", back_populates="task", cascade="all, delete-orphan")
    logs = relationship("ScrapingLog", back_populates="task", cascade="all, delete-orphan")
    exports = relationship("Export", back_populates="task")
