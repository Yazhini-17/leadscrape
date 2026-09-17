#!/usr/bin/env python
"""
Database initializer — run once to create all tables.
Usage: python init_db.py
"""
import sys
import os

# Add backend/ to path so imports work
sys.path.insert(0, os.path.dirname(__file__))

from app.database.database import engine, Base
from app.models import *  # noqa: F401,F403 — import all models to register them


def init():
    print("LeadScrape — Initializing database...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ All tables created successfully.")
        print("\nTables created:")
        for table in Base.metadata.sorted_tables:
            print(f"  - {table.name}")
    except Exception as e:
        print(f"✗ Error: {e}")
        print("\nMake sure MySQL is running and DATABASE_URL in .env is correct.")
        sys.exit(1)


if __name__ == "__main__":
    init()
