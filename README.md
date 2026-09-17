# LeadScrape

> **Web Scraping & Lead Discovery Platform** — Find businesses, crawl their websites, extract public contact information, and export leads as Excel or PDF.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide React |
| Backend | Node.js, Express, Sequelize 6, mysql2 |
| Database | MySQL |
| Scraping | Playwright, Cheerio, Axios |
| Export | ExcelJS (Excel), PDFKit (PDF) |
| Auth | JWT (jsonwebtoken), bcryptjs |

---

## Architecture

```
React (Vite + Tailwind)
       │  Axios
       ▼
  Express REST API  (server.js → src/app.js)
       │
  Background Pipeline  (setImmediate / non-blocking)
       │
  Discovery Engine ──► DuckDuckGo HTML / Bing fallback
       │
  Website Crawler ──► Axios fast fetch / Playwright JS fallback
       │
  Data Extractor ──► phones, emails, address, social links, contacts
       │
  Cleaner & Deduplicator
       │
  Sequelize ORM
       │
  MySQL Database
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL running locally
- `npx playwright install chromium` (for JS rendering, optional)

---

### 1. Database Setup

Create the MySQL database:

```sql
CREATE DATABASE leadscrape CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Sequelize will auto-sync all tables on first boot (`sequelize.sync()`).

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Install Playwright browser (for JS-rendering tasks)
npx playwright install --with-deps chromium

# Configure environment
copy .env.example .env
# Edit .env and set your DATABASE_URL, JWT_SECRET

# Start the API server (development, with auto-reload)
npm run dev

# Or start in production mode
npm start
```

API docs / health check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Set VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

Frontend available at: [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | MySQL connection string | `mysql://root:password@localhost:3306/leadscrape` |
| `JWT_SECRET` | JWT signing secret (change this!) | `changeme` |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `1440` (24h) |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:5173` |
| `PORT` | Server port | `8000` |
| `SCRAPER_TIMEOUT` | HTTP request timeout (seconds) | `15` |
| `MAX_RETRIES` | HTTP retry count | `2` |
| `RESPECT_ROBOTS_TXT` | Honor robots.txt | `true` |
| `DOMAIN_RATE_LIMIT` | Seconds between requests per domain | `2` |
| `ENV` | Environment name | `development` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

---

## How It Works

1. **Create Task** — User enters a keyword (e.g., "CBSE Schools"), location (e.g., "Puducherry"), and scraping parameters.
2. **Discovery** — The engine queries DuckDuckGo HTML search (with Bing as fallback) for matching organization websites.
3. **Deduplication** — Duplicate discoveries (same name/domain) are removed before crawling.
4. **Crawling** — Each discovered website is crawled page by page (up to `max_pages_per_site`). Axios handles fast fetches; Playwright handles JS-heavy pages when enabled.
5. **Extraction** — Phone numbers, emails, addresses, social links, and contact persons are extracted from each page's HTML using regex + Cheerio.
6. **Confidence Scoring** — Each lead is scored (0–100) based on how many fields were found:
   - Website: 20pts · Phone: 20pts · Email: 20pts · Address: 20pts · Contact: 10pts · Social: 10pts
   - HIGH ≥ 80 · MEDIUM ≥ 50 · LOW < 50
7. **Export** — Leads can be exported as Excel (.xlsx) or PDF with all extracted fields.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/scrape` | Create & start a scraping task |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/:taskId` | Get task status & metrics |
| DELETE | `/api/tasks/:taskId` | Delete task + leads |
| POST | `/api/tasks/:taskId/cancel` | Cancel running task |
| GET | `/api/tasks/:taskId/leads` | Paginated leads list |
| GET | `/api/leads/:leadId` | Full lead details |
| POST | `/api/leads/:leadId/save` | Save a lead |
| DELETE | `/api/leads/:leadId` | Delete a lead |
| GET | `/api/saved-leads` | Saved leads list |
| DELETE | `/api/saved-leads/:savedId` | Remove saved lead |
| GET | `/api/tasks/:taskId/export/excel` | Download Excel |
| GET | `/api/tasks/:taskId/export/pdf` | Download PDF |
| GET | `/api/exports` | Export history |
| GET | `/api/dashboard/stats` | Dashboard stats |
| GET | `/api/health` | Health check |

---

## Project Structure

```
leadscrape/
├── backend/
│   ├── src/
│   │   ├── config/       # App config (env vars)
│   │   ├── exports/      # Excel / PDF generators
│   │   ├── middleware/   # Auth, error handler
│   │   ├── models/       # Sequelize ORM models
│   │   ├── routes/       # Express routers
│   │   ├── scraper/      # Discovery, crawler, extractor, pipeline
│   │   ├── services/     # Auth, task, lead services
│   │   ├── utils/        # Port check, helpers
│   │   └── app.js        # Express app setup
│   ├── server.js         # Entry point (DB connect + listen)
│   ├── package.json
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
├── render.yaml           # Render.com deployment config
└── README.md
```

---

## Notes

- **No paid APIs required** — Discovery uses DuckDuckGo HTML search and Bing HTML search.
- **Responsible scraping** — robots.txt is checked by default. Rate limiting enforced per domain.
- **Playwright is opt-in** — Only used per task when "Enable JavaScript Rendering" is checked.
- **Task IDs** — Sequential format: `TASK-000001`, `TASK-000002`, etc.
- **Polling** — Frontend polls `GET /api/tasks/:taskId` every 3 seconds during active tasks.
- **Schema** — Sequelize auto-syncs all tables on first boot; no manual SQL needed.

---

## License

MIT
