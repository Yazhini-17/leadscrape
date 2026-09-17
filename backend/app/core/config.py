from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/leadscrape"
    JWT_SECRET: str = "changeme_please_use_a_real_secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    FRONTEND_URL: str = "http://localhost:5173"
    SCRAPER_TIMEOUT: int = 15
    MAX_RETRIES: int = 2
    MAX_CRAWL_DEPTH: int = 3
    DOMAIN_RATE_LIMIT: float = 2.0
    RESPECT_ROBOTS_TXT: bool = True
    ENV: str = "development"

    model_config = {"env_file": ".env", "extra": "allow"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
