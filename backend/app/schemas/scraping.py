from pydantic import BaseModel
from typing import List, Optional


class ScrapeRequest(BaseModel):
    location: str
    keyword: str
    search_radius: int = 10
    max_results: int = 100
    max_pages_per_site: int = 20
    required_fields: List[str] = ["name", "phone", "email", "website", "address"]
    respect_robots_txt: bool = True
    enable_javascript: bool = False
    crawl_internal_pages: bool = True
    enable_deduplication: bool = True


class ScrapeResponse(BaseModel):
    task_id: str
    status: str
    message: str = "Scraping task created successfully"
