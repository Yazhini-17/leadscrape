from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database.database import get_db
from app.models.user import User
from app.models.scraping_task import ScrapingTask
from app.schemas.task import TaskOut, TaskListResponse, TaskListItem
from app.core.security import get_current_user

router = APIRouter()


@router.get("/tasks", response_model=TaskListResponse)
def list_tasks(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(ScrapingTask).filter(ScrapingTask.user_id == current_user.id)
    if status:
        query = query.filter(ScrapingTask.status == status.upper())
    total = query.count()
    tasks = (
        query.order_by(ScrapingTask.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    import math
    return TaskListResponse(
        tasks=[TaskListItem.model_validate(t) for t in tasks],
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page) if total else 1,
    )


@router.get("/tasks/{task_id}", response_model=TaskOut)
def get_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = (
        db.query(ScrapingTask)
        .filter(ScrapingTask.task_id == task_id, ScrapingTask.user_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = (
        db.query(ScrapingTask)
        .filter(ScrapingTask.task_id == task_id, ScrapingTask.user_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()


@router.post("/tasks/{task_id}/cancel")
def cancel_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = (
        db.query(ScrapingTask)
        .filter(ScrapingTask.task_id == task_id, ScrapingTask.user_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.status not in ("PENDING", "RUNNING"):
        raise HTTPException(status_code=400, detail="Task cannot be cancelled in current state")
    task.status = "CANCELLED"
    task.completed_at = datetime.utcnow()
    db.commit()
    return {"message": "Task cancelled", "task_id": task_id}
