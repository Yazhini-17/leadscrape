from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TaskOut(BaseModel):
    id: int
    task_id: str
    status: str
    location: str
    keyword: str
    search_radius: int
    max_results: int
    max_pages_per_site: int
    results_discovered: int
    websites_found: int
    websites_crawled: int
    phones_found: int
    emails_found: int
    addresses_found: int
    duplicates_removed: int
    error_message: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TaskListItem(BaseModel):
    id: int
    task_id: str
    status: str
    location: str
    keyword: str
    results_discovered: int
    websites_found: int
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TaskListResponse(BaseModel):
    tasks: List[TaskListItem]
    total: int
    page: int
    per_page: int
    pages: int
