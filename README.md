# LeadScrape

> **Web Scraping & Lead Discovery Platform** — Find businesses, crawl their websites, extract public contact information, and export leads as CSV or Excel.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide React |
| Backend | Python 3.12+, FastAPI, SQLAlchemy 2.x, Pydantic v2 |
| Database | MySQL |
| Scraping | HTTPX, BeautifulSoup4, lxml, Playwright |
| Export | Python csv module, openpyxl |
| Auth | JWT (python-jose), passlib[bcrypt] |

---

## Architecture

```
React (Vite + Tailwind)
       │  Axios
       ▼
  FastAPI REST API
       │
  BackgroundTasks (Scraping Pipeline)
       │
  Discovery Engine ──► DuckDuckGo HTML / Bing fallback
       │
  Website Crawler ──► HTTPX fast fetch / Playwright JS fallback
       │
  Data Extractor ──► phones, emails, address, social links, contacts
       │
  Cleaner & Deduplicator
       │
  SQLAlchemy ORM
       │
  MySQL Database
```

---

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+ (for frontend only)
- MySQL running locally
- `pip install playwright && playwright install chromium` (for JS rendering, optional)

---

### 1. Database Setup

Create the MySQL database:

```sql
CREATE DATABASE leadscrape CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and set your DATABASE_URL, JWT_SECRET

# Initialize database tables
python init_db.py

# Start the API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env

# Start development server
npm run dev
```

Frontend available at: [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | MySQL connection string | `mysql+pymysql://root:password@localhost:3306/leadscrape` |
| `JWT_SECRET` | JWT signing secret (change this!) | `changeme` |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `1440` (24h) |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:5173` |
| `SCRAPER_TIMEOUT` | HTTP request timeout (seconds) | `15` |
| `MAX_RETRIES` | HTTP retry count | `2` |
| `RESPECT_ROBOTS_TXT` | Honor robots.txt | `true` |
| `DOMAIN_RATE_LIMIT` | Seconds between requests per domain | `2` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

---

## How It Works

1. **Create Task** — User enters a keyword (e.g., "CBSE Schools"), location (e.g., "Puducherry"), and scraping parameters.
2. **Discovery** — The engine queries DuckDuckGo HTML search (with Bing as fallback) for matching organization websites.
3. **Deduplication** — Duplicate discoveries (same name/domain) are removed before crawling.
4. **Crawling** — Each discovered website is crawled page by page (up to `max_pages_per_site`). HTTPX handles fast fetches; Playwright handles JS-heavy pages when enabled.
5. **Extraction** — Phone numbers, emails, addresses, social links, and contact persons are extracted from each page's HTML using regex + BeautifulSoup.
6. **Confidence Scoring** — Each lead is scored (0–100) based on how many fields were found:
   - Website: 20pts · Phone: 20pts · Email: 20pts · Address: 20pts · Contact: 10pts · Social: 10pts
   - HIGH ≥ 80 · MEDIUM ≥ 50 · LOW < 50
7. **Export** — Leads can be exported as CSV or Excel with all extracted fields.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/scrape` | Create & start a scraping task |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/{task_id}` | Get task status & metrics |
| DELETE | `/api/tasks/{task_id}` | Delete task + leads |
| POST | `/api/tasks/{task_id}/cancel` | Cancel running task |
| GET | `/api/tasks/{task_id}/leads` | Paginated leads list |
| GET | `/api/leads/{lead_id}` | Full lead details |
| POST | `/api/leads/{lead_id}/save` | Save a lead |
| GET | `/api/saved-leads` | Saved leads list |
| GET | `/api/tasks/{task_id}/export/csv` | Download CSV |
| GET | `/api/tasks/{task_id}/export/excel` | Download Excel |
| GET | `/api/dashboard/stats` | Dashboard stats |
| GET | `/api/health` | Health check |

---

## Project Structure

```
leadscrape/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routers
│   │   ├── core/         # Config, security
│   │   ├── database/     # SQLAlchemy engine
│   │   ├── discovery/    # Search providers (DuckDuckGo, Bing)
│   │   ├── exports/      # CSV / Excel generators
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── scraper/      # HTTP scraper, Playwright, extractor, cleaner, crawler
│   │   ├── services/     # Task, lead, deduplication, verification services
│   │   └── main.py       # FastAPI app entrypoint
│   ├── init_db.py        # Database table creator
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Auth + Theme context
│   │   ├── layouts/      # Dashboard layout
│   │   ├── pages/        # All page components
│   │   ├── services/     # Axios API services
│   │   ├── utils/        # Formatters
│   │   ├── App.jsx       # Router + providers
│   │   └── main.jsx      # React entry point
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Notes

- **No paid APIs required** — Discovery uses DuckDuckGo HTML search and Bing HTML search.
- **Responsible scraping** — robots.txt is checked by default. Rate limiting enforced per domain.
- **Playwright is opt-in** — Only used per task when "Enable JavaScript Rendering" is checked.
- **Task IDs** — Sequential format: `TASK-000001`, `TASK-000002`, etc.
- **Polling** — Frontend polls `GET /api/tasks/{task_id}` every 3 seconds during active tasks.

---

## License

MIT
