const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmailAddress = sequelize.define('EmailAddress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  organization_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  normalized: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  email_type: {
    type: DataTypes.STRING(20),
    defaultValue: 'GENERAL',
  },
  source_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_valid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'email_addresses',
  timestamps: false,
});

module.exports = EmailAddress;
