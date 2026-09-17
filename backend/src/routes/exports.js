const express = require('express');
const router = express.Router();
const {
  ScrapingTask,
  Organization,
  Export,
  Website,
  Contact,
  PhoneNumber,
  EmailAddress,
  SocialLink,
} = require('../models');
const { generatePDF } = require('../exports/pdfExport');
const { generateExcel } = require('../exports/excelExport');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

async function getTaskOrgs(taskId, userId) {
  const task = await ScrapingTask.findOne({
    where: {
      task_id: taskId,
      user_id: userId,
    },
  });

  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  const orgs = await Organization.findAll({
    where: {
      task_id: task.id,
      is_duplicate: false,
    },
    include: [
      { model: Website, as: 'websites' },
      { model: Contact, as: 'contacts' },
      { model: PhoneNumber, as: 'phone_numbers' },
      { model: EmailAddress, as: 'email_addresses' },
      { model: SocialLink, as: 'social_links' },
    ],
  });

  return { task, orgs };
}

// GET /api/tasks/:taskId/export/pdf
router.get('/tasks/:taskId/export/pdf', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { task, orgs } = await getTaskOrgs(taskId, req.user.id);

    const taskInfo = {
      task_id: task.task_id,
      location: task.location,
      keyword: task.keyword,
    };
    const pdfBuffer = await generatePDF(orgs, taskInfo);
    const dateStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const filename = `leads_${taskId}_${dateStr}.pdf`;

    await Export.create({
      task_id: task.id,
      user_id: req.user.id,
      format: 'PDF',
      filename,
      record_count: orgs.length,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:taskId/export/excel
router.get('/tasks/:taskId/export/excel', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { task, orgs } = await getTaskOrgs(taskId, req.user.id);

    const taskInfo = {
      task_id: task.task_id,
      location: task.location,
      keyword: task.keyword,
    };
    const excelBuffer = await generateExcel(orgs, taskInfo);
    const dateStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const filename = `leads_${taskId}_${dateStr}.xlsx`;

    await Export.create({
      task_id: task.id,
      user_id: req.user.id,
      format: 'EXCEL',
      filename,
      record_count: orgs.length,
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(Buffer.from(excelBuffer));
  } catch (err) {
    next(err);
  }
});

// GET /api/exports
router.get('/exports', async (req, res, next) => {
  try {
    const exports = await Export.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: ScrapingTask,
          as: 'task',
          attributes: ['task_id'],
        },
      ],
    });

    return res.json(
      exports.map(e => ({
        id: e.id,
        task_id: e.task ? e.task.task_id : null,
        format: e.format,
        filename: e.filename,
        record_count: e.record_count,
        created_at: e.created_at,
      }))
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
