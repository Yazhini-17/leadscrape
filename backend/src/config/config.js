require('dotenv').config();

// Parse DATABASE_URL if available (supports mysql:// and mysql+pymysql://)
let dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Lead123!',
  name: process.env.DB_NAME || 'leadscrape',
};

if (process.env.DATABASE_URL) {
  try {
    const rawUrl = process.env.DATABASE_URL.replace('mysql+pymysql://', 'mysql://');
    const parsed = new URL(rawUrl);
    dbConfig.host = parsed.hostname || dbConfig.host;
    dbConfig.port = parsed.port ? parseInt(parsed.port, 10) : dbConfig.port;
    dbConfig.user = decodeURIComponent(parsed.username || dbConfig.user);
    dbConfig.password = decodeURIComponent(parsed.password || dbConfig.password);
    dbConfig.name = parsed.pathname ? parsed.pathname.replace(/^\//, '') : dbConfig.name;
  } catch (err) {
    console.warn('Failed to parse DATABASE_URL, using fallback DB config:', err.message);
  }
}

module.exports = {
  PORT: parseInt(process.env.PORT || '8000', 10),
  ENV: process.env.ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  DB: dbConfig,
  JWT_SECRET: process.env.JWT_SECRET || 'change_this_to_a_long_random_secret_string_at_least_32_chars',
  JWT_ALGORITHM: process.env.JWT_ALGORITHM || 'HS256',
  ACCESS_TOKEN_EXPIRE_MINUTES: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '1440', 10),
  SCRAPER_TIMEOUT: parseInt(process.env.SCRAPER_TIMEOUT || '15', 10),
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES || '2', 10),
  MAX_CRAWL_DEPTH: parseInt(process.env.MAX_CRAWL_DEPTH || '3', 10),
  DOMAIN_RATE_LIMIT: parseFloat(process.env.DOMAIN_RATE_LIMIT || '2.0'),
  RESPECT_ROBOTS_TXT: process.env.RESPECT_ROBOTS_TXT !== 'false',
};
