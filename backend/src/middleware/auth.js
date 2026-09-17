const { verifyToken } = require('../services/authService');
const { User } = require('../models');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload || !payload.sub) {
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }

  try {
    const user = await User.findByPk(parseInt(payload.sub, 10));
    if (!user) {
      return res.status(401).json({ detail: 'Could not validate credentials' });
    }
    if (!user.is_active) {
      return res.status(403).json({ detail: 'Account is disabled' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }
}

module.exports = {
  authenticateToken,
};
