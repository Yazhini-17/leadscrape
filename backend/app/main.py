from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.database.database import engine, Base

# Import all models so SQLAlchemy registers them before create_all
from app.models import (  # noqa: F401
    User, ScrapingTask, Organization, Website, Contact,
    PhoneNumber, EmailAddress, SourcePage, SocialLink,
    SavedLead, ScrapingLog, Export,
)

from app.api import auth, scraping, tasks, leads, dashboard, exports

settings = get_settings()

app = FastAPI(
    title="LeadScrape API",
    description=(
        "B2B Lead Generation Platform — Discover businesses, crawl websites, "
        "extract public contact information, and export leads."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Auto-create all tables on startup
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(scraping.router, prefix="/api", tags=["Scraping"])
app.include_router(tasks.router, prefix="/api", tags=["Tasks"])
app.include_router(leads.router, prefix="/api", tags=["Leads"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(exports.router, prefix="/api", tags=["Exports"])


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "version": "1.0.0", "service": "LeadScrape API"}
