const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Website = sequelize.define('Website', {
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
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  domain: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  is_official: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  discovery_source: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'ACTIVE',
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'websites',
  timestamps: false,
});

module.exports = Website;
