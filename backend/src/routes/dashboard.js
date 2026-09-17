const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const {
  ScrapingTask,
  Organization,
  Export,
  PhoneNumber,
  EmailAddress,
} = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/dashboard/stats
router.get('/dashboard/stats', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch user tasks
    const tasks = await ScrapingTask.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });

    const total_tasks = tasks.length;
    const completed_tasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const failed_tasks = tasks.filter(t => t.status === 'FAILED').length;
    const running_tasks = tasks.filter(t => t.status === 'RUNNING').length;

    const total_websites_crawled = tasks.reduce((sum, t) => sum + (t.websites_crawled || 0), 0);

    const taskIds = tasks.map(t => t.id);

    // 2. Recent tasks (last 5)
    const recent_tasks = tasks.slice(0, 5).map(t => ({
      id: t.id,
      task_id: t.task_id,
      status: t.status,
      location: t.location,
      keyword: t.keyword,
      results_discovered: t.results_discovered,
      websites_found: t.websites_found,
      created_at: t.created_at,
      completed_at: t.completed_at,
    }));

    // 3. Organization metrics
    let total_leads = 0;
    let high_confidence = 0;
    let medium_confidence = 0;
    let low_confidence = 0;
    let total_phones = 0;
    let total_emails = 0;

    const lead_trend = [];
    const today = new Date();
    // Generate dates for last 7 days in YYYY-MM-DD format
    const dateMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dateMap[dateStr] = 0;
    }

    if (taskIds.length > 0) {
      const orgs = await Organization.findAll({
        where: {
          task_id: { [Op.in]: taskIds },
          is_duplicate: false,
        },
        attributes: ['id', 'confidence_level', 'created_at'],
      });

      total_leads = orgs.length;

      for (const org of orgs) {
        const level = (org.confidence_level || 'LOW').toUpperCase();
        if (level === 'HIGH') high_confidence++;
        else if (level === 'MEDIUM') medium_confidence++;
        else low_confidence++;

        if (org.created_at) {
          const orgDate = new Date(org.created_at).toISOString().split('T')[0];
          if (dateMap[orgDate] !== undefined) {
            dateMap[orgDate]++;
          }
        }
      }

      // Counts for phones and emails
      const orgIds = orgs.map(o => o.id);
      if (orgIds.length > 0) {
        total_phones = await PhoneNumber.count({
          where: { organization_id: { [Op.in]: orgIds } },
        });
        total_emails = await EmailAddress.count({
          where: { organization_id: { [Op.in]: orgIds } },
        });
      }
    }

    // Convert dateMap to sorted array
    for (const [date, count] of Object.entries(dateMap)) {
      lead_trend.push({ date, count });
    }

    // 4. Total exports
    const total_exports = await Export.count({
      where: { user_id: userId },
    });

    return res.json({
      total_tasks,
      total_leads,
      completed_tasks,
      failed_tasks,
      running_tasks,
      total_exports,
      high_confidence,
      medium_confidence,
      low_confidence,
      total_phones,
      total_emails,
      total_websites_crawled,
      lead_trend,
      recent_tasks,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
