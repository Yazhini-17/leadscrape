const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const {
  ScrapingTask,
  Organization,
  SavedLead,
  Website,
  Contact,
  PhoneNumber,
  EmailAddress,
  SocialLink,
  SourcePage,
} = require('../models');
const { buildLeadListItem } = require('../services/leadService');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/tasks/:taskId/leads
router.get('/tasks/:taskId/leads', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const perPage = Math.min(100, Math.max(1, parseInt(req.query.per_page || '20', 10)));
    const search = req.query.search ? String(req.query.search).trim() : null;
    const confidence = req.query.confidence ? String(req.query.confidence).toUpperCase() : null;

    const task = await ScrapingTask.findOne({
      where: {
        task_id: taskId,
        user_id: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ detail: 'Task not found' });
    }

    const where = {
      task_id: task.id,
      is_duplicate: false,
    };

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (confidence) {
      where.confidence_level = confidence;
    }

    const { count, rows: orgs } = await Organization.findAndCountAll({
      where,
      order: [['confidence_score', 'DESC']],
      offset: (page - 1) * perPage,
      limit: perPage,
      include: [
        { model: Website, as: 'websites' },
        { model: PhoneNumber, as: 'phone_numbers' },
        { model: EmailAddress, as: 'email_addresses' },
        { model: Contact, as: 'contacts' },
      ],
    });

    const userSavedLeads = await SavedLead.findAll({
      where: { user_id: req.user.id },
      attributes: ['organization_id'],
    });
    const savedIds = new Set(userSavedLeads.map(s => s.organization_id));

    const leads = orgs.map(org => buildLeadListItem(org, savedIds));

    return res.json({
      leads,
      total: count,
      page,
      per_page: perPage,
      pages: count > 0 ? Math.ceil(count / perPage) : 1,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/leads/:leadId
router.get('/leads/:leadId', async (req, res, next) => {
  try {
    const leadId = parseInt(req.params.leadId, 10);
    const org = await Organization.findByPk(leadId, {
      include: [
        { model: Website, as: 'websites' },
        { model: PhoneNumber, as: 'phone_numbers' },
        { model: EmailAddress, as: 'email_addresses' },
        { model: Contact, as: 'contacts' },
        { model: SocialLink, as: 'social_links' },
        { model: SourcePage, as: 'source_pages' },
      ],
    });

    if (!org) {
      return res.status(404).json({ detail: 'Lead not found' });
    }

    // Verify task ownership
    const task = await ScrapingTask.findOne({
      where: {
        id: org.task_id,
        user_id: req.user.id,
      },
    });

    if (!task) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    return res.json(org);
  } catch (err) {
    next(err);
  }
});

// POST /api/leads/:leadId/save
router.post('/leads/:leadId/save', async (req, res, next) => {
  try {
    const leadId = parseInt(req.params.leadId, 10);
    const org = await Organization.findByPk(leadId);
    if (!org) {
      return res.status(404).json({ detail: 'Lead not found' });
    }

    const existing = await SavedLead.findOne({
      where: {
        user_id: req.user.id,
        organization_id: leadId,
      },
    });

    if (existing) {
      return res.json({ message: 'Already saved', id: existing.id });
    }

    const saved = await SavedLead.create({
      user_id: req.user.id,
      organization_id: leadId,
      notes: req.body?.notes || null,
    });

    return res.json({ message: 'Lead saved', id: saved.id });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/leads/:leadId
router.delete('/leads/:leadId', async (req, res, next) => {
  try {
    const leadId = parseInt(req.params.leadId, 10);
    const org = await Organization.findByPk(leadId);
    if (!org) {
      return res.status(404).json({ detail: 'Lead not found' });
    }

    const task = await ScrapingTask.findOne({
      where: {
        id: org.task_id,
        user_id: req.user.id,
      },
    });

    if (!task) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    await SavedLead.destroy({ where: { organization_id: org.id } });
    await Website.destroy({ where: { organization_id: org.id } });
    await Contact.destroy({ where: { organization_id: org.id } });
    await PhoneNumber.destroy({ where: { organization_id: org.id } });
    await EmailAddress.destroy({ where: { organization_id: org.id } });
    await SourcePage.destroy({ where: { organization_id: org.id } });
    await SocialLink.destroy({ where: { organization_id: org.id } });
    await org.destroy();

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// GET /api/saved-leads
router.get('/saved-leads', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const perPage = Math.min(100, Math.max(1, parseInt(req.query.per_page || '20', 10)));

    const { count, rows: savedRows } = await SavedLead.findAndCountAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      offset: (page - 1) * perPage,
      limit: perPage,
      include: [
        {
          model: Organization,
          as: 'organization',
          include: [
            { model: Website, as: 'websites' },
            { model: PhoneNumber, as: 'phone_numbers' },
            { model: EmailAddress, as: 'email_addresses' },
            { model: Contact, as: 'contacts' },
          ],
        },
      ],
    });

    const savedIds = new Set(savedRows.map(s => s.organization_id));

    const leads = [];
    const savedLeads = [];

    for (const s of savedRows) {
      if (s.organization) {
        leads.push(buildLeadListItem(s.organization, savedIds));
        savedLeads.push({
          id: s.id,
          user_id: s.user_id,
          organization_id: s.organization_id,
          notes: s.notes,
          created_at: s.created_at,
          organization: s.organization,
        });
      }
    }

    return res.json({
      saved_leads: savedLeads,
      leads,
      total: count,
      page,
      per_page: perPage,
      pages: count > 0 ? Math.ceil(count / perPage) : 1,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/saved-leads/:savedId
router.delete('/saved-leads/:savedId', async (req, res, next) => {
  try {
    const savedId = parseInt(req.params.savedId, 10);
    const saved = await SavedLead.findOne({
      where: {
        id: savedId,
        user_id: req.user.id,
      },
    });

    if (!saved) {
      return res.status(404).json({ detail: 'Saved lead not found' });
    }

    await saved.destroy();
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
