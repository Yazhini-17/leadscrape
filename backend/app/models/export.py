from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database.database import Base


class Export(Base):
    __tablename__ = "exports"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("scraping_tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    format = Column(String(10), nullable=False)  # CSV/EXCEL
    filename = Column(String(255), nullable=True)
    record_count = Column(Integer, default=0)
    file_path = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    task = relationship("ScrapingTask", back_populates="exports")
    user = relationship("User", back_populates="exports")
