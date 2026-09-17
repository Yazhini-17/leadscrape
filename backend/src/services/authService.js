const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

function hashPassword(password) {
  // Use salt round 12 to match Python passlib default
  return bcrypt.hashSync(password, 12);
}

function verifyPassword(plain, hashed) {
  return bcrypt.compareSync(plain, hashed);
}

function createAccessToken(data, expiresMinutes = config.ACCESS_TOKEN_EXPIRE_MINUTES) {
  const expiresIn = `${expiresMinutes}m`;
  return jwt.sign(data, config.JWT_SECRET, {
    algorithm: config.JWT_ALGORITHM,
    expiresIn,
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: [config.JWT_ALGORITHM],
    });
  } catch (err) {
    return null;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  createAccessToken,
  verifyToken,
};
