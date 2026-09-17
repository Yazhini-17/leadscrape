from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database.database import get_db
from app.models.user import User
from app.models.organization import Organization
from app.models.saved_lead import SavedLead
from app.models.scraping_task import ScrapingTask
from app.schemas.lead import OrganizationOut, LeadListItem, LeadListResponse, SavedLeadOut
from app.core.security import get_current_user
from app.services.lead_service import build_lead_list_item, calculate_confidence
import math

router = APIRouter()


@router.get("/tasks/{task_id}/leads", response_model=LeadListResponse)
def get_task_leads(
    task_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    confidence: Optional[str] = None,
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

    query = db.query(Organization).filter(
        Organization.task_id == task.id,
        Organization.is_duplicate == False,
    )

    if search:
        s = f"%{search}%"
        query = query.filter(Organization.name.ilike(s))

    if confidence:
        query = query.filter(Organization.confidence_level == confidence.upper())

    total = query.count()
    orgs = (
        query.order_by(Organization.confidence_score.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    saved_ids = {
        s.organization_id
        for s in db.query(SavedLead).filter(SavedLead.user_id == current_user.id).all()
    }

    leads = [build_lead_list_item(org, saved_ids) for org in orgs]

    return LeadListResponse(
        leads=leads,
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page) if total else 1,
    )


@router.get("/leads/{lead_id}", response_model=OrganizationOut)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org = db.query(Organization).filter(Organization.id == lead_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Lead not found")
    # Check ownership via task
    task = db.query(ScrapingTask).filter(
        ScrapingTask.id == org.task_id, ScrapingTask.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=403, detail="Access denied")
    return org


@router.post("/leads/{lead_id}/save")
def save_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org = db.query(Organization).filter(Organization.id == lead_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Lead not found")

    existing = db.query(SavedLead).filter(
        SavedLead.user_id == current_user.id,
        SavedLead.organization_id == lead_id,
    ).first()
    if existing:
        return {"message": "Already saved", "id": existing.id}

    saved = SavedLead(user_id=current_user.id, organization_id=lead_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return {"message": "Lead saved", "id": saved.id}


@router.delete("/leads/{lead_id}", status_code=204)
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org = db.query(Organization).filter(Organization.id == lead_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Lead not found")
    task = db.query(ScrapingTask).filter(
        ScrapingTask.id == org.task_id, ScrapingTask.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=403, detail="Access denied")
    db.delete(org)
    db.commit()


@router.get("/saved-leads", response_model=LeadListResponse)
def get_saved_leads(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(SavedLead).filter(SavedLead.user_id == current_user.id)
    total = query.count()
    saved = (
        query.order_by(SavedLead.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    saved_ids = {s.organization_id for s in saved}
    leads = [build_lead_list_item(s.organization, saved_ids) for s in saved if s.organization]
    return LeadListResponse(
        leads=leads,
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page) if total else 1,
    )


@router.delete("/saved-leads/{saved_id}", status_code=204)
def remove_saved_lead(
    saved_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved = db.query(SavedLead).filter(
        SavedLead.id == saved_id, SavedLead.user_id == current_user.id
    ).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved lead not found")
    db.delete(saved)
    db.commit()
