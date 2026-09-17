from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database.database import Base


class ScrapingLog(Base):
    __tablename__ = "scraping_logs"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("scraping_tasks.id"), nullable=False)

    url = Column(Text, nullable=True)
    status = Column(String(20), default="SUCCESS")  # SUCCESS/FAILED/BLOCKED/TIMEOUT/SKIPPED
    error_message = Column(Text, nullable=True)
    pages_crawled = Column(Integer, default=0)
    phones_extracted = Column(Integer, default=0)
    emails_extracted = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    task = relationship("ScrapingTask", back_populates="logs")
