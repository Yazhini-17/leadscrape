from sqlalchemy.orm import Session
from app.models.scraping_task import ScrapingTask
from datetime import datetime


def generate_task_id(db: Session) -> str:
    """Generate a unique sequential task ID like TASK-000001."""
    max_task = db.query(ScrapingTask).order_by(ScrapingTask.id.desc()).first()
    if max_task and max_task.id:
        next_num = max_task.id + 1
    else:
        next_num = 1
    return f"TASK-{next_num:06d}"


def get_task_by_task_id(db: Session, task_id: str, user_id: int) -> ScrapingTask:
    return (
        db.query(ScrapingTask)
        .filter(ScrapingTask.task_id == task_id, ScrapingTask.user_id == user_id)
        .first()
    )


def update_task_status(db: Session, task_db_id: int, status: str, **kwargs):
    task = db.query(ScrapingTask).filter(ScrapingTask.id == task_db_id).first()
    if task:
        task.status = status
        for key, value in kwargs.items():
            if hasattr(task, key):
                setattr(task, key, value)
        if status in ("COMPLETED", "FAILED", "CANCELLED") and not task.completed_at:
            task.completed_at = datetime.utcnow()
        db.commit()


def increment_task_counter(db: Session, task_db_id: int, field: str, amount: int = 1):
    task = db.query(ScrapingTask).filter(ScrapingTask.id == task_db_id).first()
    if task and hasattr(task, field):
        current = getattr(task, field) or 0
        setattr(task, field, current + amount)
        db.commit()
