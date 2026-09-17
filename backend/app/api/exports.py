from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.database import get_db
from app.models.user import User
from app.models.scraping_task import ScrapingTask
from app.models.organization import Organization
from app.models.export import Export
from app.core.security import get_current_user
from app.exports.csv_export import generate_csv
from app.exports.excel_export import generate_excel
import io

router = APIRouter()


def get_task_orgs(task_id: str, user_id: int, db: Session):
    task = db.query(ScrapingTask).filter(
        ScrapingTask.task_id == task_id, ScrapingTask.user_id == user_id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    orgs = db.query(Organization).filter(
        Organization.task_id == task.id,
        Organization.is_duplicate == False,
    ).all()
    return task, orgs


@router.get("/tasks/{task_id}/export/csv")
def export_csv(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task, orgs = get_task_orgs(task_id, current_user.id, db)
    csv_content = generate_csv(orgs)
    filename = f"leads_{task_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    # Log export
    export = Export(
        task_id=task.id, user_id=current_user.id,
        format="CSV", filename=filename, record_count=len(orgs)
    )
    db.add(export)
    db.commit()

    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/tasks/{task_id}/export/excel")
def export_excel(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task, orgs = get_task_orgs(task_id, current_user.id, db)
    task_info = {"task_id": task.task_id, "location": task.location, "keyword": task.keyword}
    excel_bytes = generate_excel(orgs, task_info)
    filename = f"leads_{task_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.xlsx"

    # Log export
    export = Export(
        task_id=task.id, user_id=current_user.id,
        format="EXCEL", filename=filename, record_count=len(orgs)
    )
    db.add(export)
    db.commit()

    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/exports")
def list_exports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exports = (
        db.query(Export)
        .filter(Export.user_id == current_user.id)
        .order_by(Export.created_at.desc())
        .all()
    )
    return [
        {
            "id": e.id,
            "task_id": e.task.task_id if e.task else None,
            "format": e.format,
            "filename": e.filename,
            "record_count": e.record_count,
            "created_at": e.created_at,
        }
        for e in exports
    ]
