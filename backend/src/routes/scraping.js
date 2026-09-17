const express = require('express');
const router = express.Router();
const { ScrapingTask } = require('../models');
const { generateTaskId } = require('../services/taskService');
const { runScrapingPipeline } = require('../scraper/pipeline');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// POST /api/scrape
router.post('/scrape', async (req, res, next) => {
  try {
    const {
      location,
      search_radius = 10,
      max_results = 100,
      max_pages_per_site = 20,
      required_fields = ['name', 'phone', 'email', 'website', 'address'],
      respect_robots_txt = true,
      enable_javascript = false,
      crawl_internal_pages = true,
      enable_deduplication = true,
    } = req.body;
    const keyword = req.body.keyword || req.body.business_type;

    if (!location || !keyword) {
      return res.status(400).json({ detail: 'Location and keyword are required' });
    }

    const taskId = await generateTaskId();

    const task = await ScrapingTask.create({
      task_id: taskId,
      user_id: req.user.id,
      status: 'PENDING',
      location,
      keyword,
      search_radius,
      max_results,
      max_pages_per_site,
      required_fields: JSON.stringify(required_fields),
    });

    // Run async scraping pipeline in background (non-blocking)
    setImmediate(() => {
      runScrapingPipeline(task.id, taskId, {
        location,
        keyword,
        search_radius,
        max_results,
        max_pages_per_site,
        required_fields,
        respect_robots_txt,
        enable_javascript,
        crawl_internal_pages,
        enable_deduplication,
      }).catch(err => {
        console.error(`Background scraping pipeline error for ${taskId}:`, err);
      });
    });

    return res.status(201).json({
      task_id: taskId,
      status: 'PENDING',
      message: 'Scraping task created successfully',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
