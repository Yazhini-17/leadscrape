const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { hashPassword, verifyPassword, createAccessToken } = require('../services/authService');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, full_name, password } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ detail: 'Email, full name, and password are required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    const hashedPassword = hashPassword(password);
    const user = await User.create({
      email,
      full_name,
      hashed_password: hashedPassword,
      is_active: true,
      is_verified: false,
    });

    const accessToken = createAccessToken({ sub: String(user.id) });

    return res.status(201).json({
      access_token: accessToken,
      token_type: 'bearer',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_active: user.is_active,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ detail: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !verifyPassword(password, user.hashed_password)) {
      return res.status(401).json({ detail: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ detail: 'Account is disabled' });
    }

    const accessToken = createAccessToken({ sub: String(user.id) });

    return res.json({
      access_token: accessToken,
      token_type: 'bearer',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_active: user.is_active,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  return res.json({
    id: req.user.id,
    email: req.user.email,
    full_name: req.user.full_name,
    is_active: req.user.is_active,
    created_at: req.user.created_at,
  });
});

module.exports = router;
