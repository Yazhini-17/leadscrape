const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const tasksRoutes = require('./tasks');
const scrapingRoutes = require('./scraping');
const leadsRoutes = require('./leads');
const dashboardRoutes = require('./dashboard');
const exportsRoutes = require('./exports');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', service: 'LeadScrape API' });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/', scrapingRoutes);
router.use('/', tasksRoutes);
router.use('/', leadsRoutes);
router.use('/', dashboardRoutes);
router.use('/', exportsRoutes);

module.exports = router;
