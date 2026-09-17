const app = require('../backend/src/app');
const { sequelize } = require('../backend/src/models');

// Initialize database connection if not already connected
let isDbConnected = false;

async function ensureDbConnection() {
  if (!isDbConnected) {
    try {
      await sequelize.authenticate();
      console.log('Database connected successfully');
      isDbConnected = true;
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }
}

// Vercel serverless function handler
module.exports = async (req, res) => {
  try {
    await ensureDbConnection();
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};