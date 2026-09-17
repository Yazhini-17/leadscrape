from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.models.scraping_task import ScrapingTask
from app.models.organization import Organization
from app.core.security import get_current_user
from app.schemas.task import TaskListItem

router = APIRouter()


@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tasks = db.query(ScrapingTask).filter(ScrapingTask.user_id == current_user.id).all()
    total_tasks = len(tasks)
    completed = sum(1 for t in tasks if t.status == "COMPLETED")
    failed = sum(1 for t in tasks if t.status == "FAILED")
    running = sum(1 for t in tasks if t.status == "RUNNING")

    # Count total leads (non-duplicate orgs)
    total_leads = (
        db.query(Organization)
        .join(ScrapingTask, Organization.task_id == ScrapingTask.id)
        .filter(
            ScrapingTask.user_id == current_user.id,
            Organization.is_duplicate == False,
        )
        .count()
    )

    # Recent tasks (last 5)
    recent_tasks = (
        db.query(ScrapingTask)
        .filter(ScrapingTask.user_id == current_user.id)
        .order_by(ScrapingTask.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_tasks": total_tasks,
        "total_leads": total_leads,
        "completed_tasks": completed,
        "failed_tasks": failed,
        "running_tasks": running,
        "recent_tasks": [TaskListItem.model_validate(t).model_dump() for t in recent_tasks],
    }
