"""
generate_schema.py
Generates backend/schema.sql by using SQLAlchemy's own DDL compiler
against the MySQL dialect.  This guarantees the output matches exactly
what create_all() would produce — no hand-translation involved.

Run from the backend/ directory:
    python generate_schema.py
"""
import sys, os, textwrap, re
from datetime import datetime

# ── Allow imports from app/ without installing the package ──────────────────
sys.path.insert(0, os.path.dirname(__file__))

# ── Must set DATABASE_URL before importing app modules ──────────────────────
os.environ["DATABASE_URL"] = "mysql+pymysql://x:x@localhost/x"

# ── Import Base and all models so their tables register ─────────────────────
from app.database.database import Base          # noqa: E402
import app.models                               # noqa: F401,E402

# ── Use SQLAlchemy's MySQL dialect DDL compiler ──────────────────────────────
from sqlalchemy.dialects import mysql as mysql_dialect
from sqlalchemy.schema import CreateTable, CreateIndex

dialect = mysql_dialect.dialect()

# ── Sort tables in dependency order (topological) ───────────────────────────
sorted_tables = list(Base.metadata.sorted_tables)

# ── Header ───────────────────────────────────────────────────────────────────
header = (
    "-- =============================================================\n"
    "-- LeadScrape -- MySQL Schema\n"
    f"-- Generated : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
    "-- Source    : Derived from app/models/ via SQLAlchemy DDL compiler\n"
    "-- Dialect   : MySQL (mysql+pymysql)\n"
    "--\n"
    "-- IMPORTANT: Keep this file in sync with app/models/ if the\n"
    "--            SQLAlchemy models change.  Re-generate by running:\n"
    "--                python generate_schema.py\n"
    "-- =============================================================\n"
    "\n"
    "SET NAMES utf8mb4;\n"
    "SET FOREIGN_KEY_CHECKS = 0;\n"
    "\n"
    "-- -------------------------------------------------------------\n"
    "-- Create and select the database\n"
    "-- Matches DATABASE_URL in .env: mysql+pymysql://root:password@localhost:3306/leadscrape\n"
    "-- -------------------------------------------------------------\n"
    "CREATE DATABASE IF NOT EXISTS leadscrape\n"
    "  CHARACTER SET utf8mb4\n"
    "  COLLATE utf8mb4_unicode_ci;\n"
    "\n"
    "USE leadscrape;\n"
)


footer = "\nSET FOREIGN_KEY_CHECKS = 1;\n"

lines = [header]

for table in sorted_tables:
    # ── CREATE TABLE ─────────────────────────────────────────────────────────
    compiled = CreateTable(table).compile(dialect=dialect)
    sql = str(compiled).strip()

    # Append storage engine / charset (MySQL requires this to be self-contained)
    sql = sql.rstrip()
    if sql.endswith(")"):
        sql += "\nENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    sql += ";"

    lines.append(sql)
    lines.append("")

    # ── Indexes ──────────────────────────────────────────────────────────────
    # SQLAlchemy's CreateTable does NOT always embed UNIQUE constraints in the
    # body when compiling to a plain string (it depends on the compile context).
    # We emit every index explicitly here so nothing is missed.
    for idx in sorted(table.indexes, key=lambda x: x.name or ""):
        try:
            idx_sql = str(CreateIndex(idx).compile(dialect=dialect)).strip() + ";"
            lines.append(idx_sql)
        except Exception as exc:
            lines.append(f"-- WARNING: could not compile index {idx.name}: {exc}")

    lines.append("")

output = "\n".join(lines) + footer

out_path = os.path.join(os.path.dirname(__file__), "schema.sql")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(output)

print(f"[OK] schema.sql written to: {out_path}")
print(f"\nTables ({len(sorted_tables)}):")
for t in sorted_tables:
    unique_idxs = [i for i in t.indexes if i.unique]
    regular_idxs = [i for i in t.indexes if not i.unique]
    fk_count  = len(list(t.foreign_keys))
    print(
        f"  {t.name:<30} "
        f"cols={len(t.columns)}  "
        f"fks={fk_count}  "
        f"unique_indexes={len(unique_idxs)}  "
        f"indexes={len(regular_idxs)}"
    )
