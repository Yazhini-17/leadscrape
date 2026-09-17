const express = require('express');
const router = express.Router();
const { ScrapingTask } = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/tasks
router.get('/tasks', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const perPage = Math.min(100, Math.max(1, parseInt(req.query.per_page || '20', 10)));
    const status = req.query.status ? String(req.query.status).toUpperCase() : null;

    const where = { user_id: req.user.id };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await ScrapingTask.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      offset: (page - 1) * perPage,
      limit: perPage,
    });

    const tasks = rows.map(t => ({
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

    return res.json({
      tasks,
      total: count,
      page,
      per_page: perPage,
      pages: count > 0 ? Math.ceil(count / perPage) : 1,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:taskId
router.get('/tasks/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await ScrapingTask.findOne({
      where: {
        task_id: taskId,
        user_id: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ detail: 'Task not found' });
    }

    return res.json({
      id: task.id,
      task_id: task.task_id,
      status: task.status,
      location: task.location,
      keyword: task.keyword,
      search_radius: task.search_radius,
      max_results: task.max_results,
      max_pages_per_site: task.max_pages_per_site,
      results_discovered: task.results_discovered,
      websites_found: task.websites_found,
      websites_crawled: task.websites_crawled,
      phones_found: task.phones_found,
      emails_found: task.emails_found,
      addresses_found: task.addresses_found,
      duplicates_removed: task.duplicates_removed,
      error_message: task.error_message,
      created_at: task.created_at,
      updated_at: task.updated_at,
      completed_at: task.completed_at,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:taskId
router.delete('/tasks/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await ScrapingTask.findOne({
      where: {
        task_id: taskId,
        user_id: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ detail: 'Task not found' });
    }

    const {
      Organization,
      Website,
      Contact,
      PhoneNumber,
      EmailAddress,
      SourcePage,
      SocialLink,
      SavedLead,
      ScrapingLog,
      Export,
    } = require('../models');

    const orgs = await Organization.findAll({
      where: { task_id: task.id },
      attributes: ['id'],
    });
    const orgIds = orgs.map(o => o.id);

    if (orgIds.length > 0) {
      const { Op } = require('sequelize');
      await SavedLead.destroy({ where: { organization_id: { [Op.in]: orgIds } } });
      await Website.destroy({ where: { organization_id: { [Op.in]: orgIds } } });
      await Contact.destroy({ where: { organization_id: { [Op.in]: orgIds } } });
      await PhoneNumber.destroy({ where: { organization_id: { [Op.in]: orgIds } } });
      await EmailAddress.destroy({ where: { organization_id: { [Op.in]: orgIds } } });
      await SourcePage.destroy({ where: { organization_id: { [Op.in]: orgIds } } });
      await SocialLink.destroy({ where: { organization_id: { [Op.in]: orgIds } } });
      await Organization.destroy({ where: { id: { [Op.in]: orgIds } } });
    }

    await ScrapingLog.destroy({ where: { task_id: task.id } });
    await Export.destroy({ where: { task_id: task.id } });
    await task.destroy();

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks/:taskId/cancel
router.post('/tasks/:taskId/cancel', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await ScrapingTask.findOne({
      where: {
        task_id: taskId,
        user_id: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ detail: 'Task not found' });
    }

    if (!['PENDING', 'RUNNING'].includes(task.status)) {
      return res.status(400).json({ detail: 'Task cannot be cancelled in current state' });
    }

    task.status = 'CANCELLED';
    task.completed_at = new Date();
    await task.save();

    return res.json({ message: 'Task cancelled', task_id: taskId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
