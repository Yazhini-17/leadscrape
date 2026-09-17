-- =============================================================
-- LeadScrape -- MySQL Schema
-- Generated : 2026-09-15 11:33:22
-- Source    : Derived from app/models/ via SQLAlchemy DDL compiler
-- Dialect   : MySQL (mysql+pymysql)
--
-- IMPORTANT: Keep this file in sync with app/models/ if the
--            SQLAlchemy models change.  Re-generate by running:
--                python generate_schema.py
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------
-- Create and select the database
-- Matches DATABASE_URL in .env: mysql+pymysql://root:password@localhost:3306/leadscrape
-- -------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS leadscrape
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE leadscrape;

CREATE TABLE users (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	email VARCHAR(255) NOT NULL, 
	full_name VARCHAR(255) NOT NULL, 
	hashed_password VARCHAR(255) NOT NULL, 
	is_active BOOL, 
	is_verified BOOL, 
	created_at DATETIME DEFAULT now(), 
	updated_at DATETIME DEFAULT now(), 
	PRIMARY KEY (id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE UNIQUE INDEX ix_users_email ON users (email);
CREATE INDEX ix_users_id ON users (id);

CREATE TABLE scraping_tasks (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	task_id VARCHAR(20) NOT NULL, 
	user_id INTEGER NOT NULL, 
	status VARCHAR(20), 
	location VARCHAR(255) NOT NULL, 
	keyword VARCHAR(255) NOT NULL, 
	search_radius INTEGER, 
	max_results INTEGER, 
	max_pages_per_site INTEGER, 
	required_fields TEXT, 
	results_discovered INTEGER, 
	websites_found INTEGER, 
	websites_crawled INTEGER, 
	phones_found INTEGER, 
	emails_found INTEGER, 
	addresses_found INTEGER, 
	duplicates_removed INTEGER, 
	error_message TEXT, 
	created_at DATETIME DEFAULT now(), 
	updated_at DATETIME DEFAULT now(), 
	completed_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_scraping_tasks_id ON scraping_tasks (id);
CREATE UNIQUE INDEX ix_scraping_tasks_task_id ON scraping_tasks (task_id);

CREATE TABLE exports (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	task_id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	format VARCHAR(10) NOT NULL, 
	filename VARCHAR(255), 
	record_count INTEGER, 
	file_path TEXT, 
	created_at DATETIME DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(task_id) REFERENCES scraping_tasks (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_exports_id ON exports (id);

CREATE TABLE organizations (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	task_id INTEGER NOT NULL, 
	name VARCHAR(500) NOT NULL, 
	category VARCHAR(255), 
	location VARCHAR(255), 
	address TEXT, 
	street VARCHAR(500), 
	area VARCHAR(255), 
	city VARCHAR(255), 
	state VARCHAR(255), 
	pincode VARCHAR(10), 
	address_source TEXT, 
	confidence_score FLOAT, 
	confidence_level VARCHAR(10), 
	source VARCHAR(255), 
	is_duplicate BOOL, 
	created_at DATETIME DEFAULT now(), 
	updated_at DATETIME DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(task_id) REFERENCES scraping_tasks (id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_organizations_id ON organizations (id);

CREATE TABLE scraping_logs (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	task_id INTEGER NOT NULL, 
	url TEXT, 
	status VARCHAR(20), 
	error_message TEXT, 
	pages_crawled INTEGER, 
	phones_extracted INTEGER, 
	emails_extracted INTEGER, 
	created_at DATETIME DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(task_id) REFERENCES scraping_tasks (id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_scraping_logs_id ON scraping_logs (id);

CREATE TABLE contacts (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	organization_id INTEGER NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	designation VARCHAR(255), 
	source_url TEXT, 
	created_at DATETIME DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_contacts_id ON contacts (id);

CREATE TABLE email_addresses (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	organization_id INTEGER NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	normalized VARCHAR(255), 
	email_type VARCHAR(20), 
	source_url TEXT, 
	is_valid BOOL, 
	created_at DATETIME DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_email_addresses_id ON email_addresses (id);

CREATE TABLE phone_numbers (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	organization_id INTEGER NOT NULL, 
	number VARCHAR(50) NOT NULL, 
	normalized VARCHAR(50), 
	phone_type VARCHAR(20), 
	source_url TEXT, 
	is_whatsapp BOOL, 
	created_at DATETIME DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_phone_numbers_id ON phone_numbers (id);

CREATE TABLE saved_leads (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	user_id INTEGER NOT NULL, 
	organization_id INTEGER NOT NULL, 
	notes TEXT, 
	created_at DATETIME DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_saved_leads_id ON saved_leads (id);

CREATE TABLE social_links (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	organization_id INTEGER NOT NULL, 
	platform VARCHAR(30) NOT NULL, 
	url TEXT NOT NULL, 
	is_valid BOOL, 
	created_at DATETIME DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_social_links_id ON social_links (id);

CREATE TABLE source_pages (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	organization_id INTEGER NOT NULL, 
	url TEXT NOT NULL, 
	page_type VARCHAR(50), 
	status_code INTEGER, 
	scraped_at DATETIME, 
	created_at DATETIME DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_source_pages_id ON source_pages (id);

CREATE TABLE websites (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	organization_id INTEGER NOT NULL, 
	url TEXT NOT NULL, 
	domain VARCHAR(255), 
	is_official BOOL, 
	discovery_source VARCHAR(255), 
	confidence FLOAT, 
	status VARCHAR(20), 
	error_message TEXT, 
	created_at DATETIME DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_websites_id ON websites (id);

SET FOREIGN_KEY_CHECKS = 1;
