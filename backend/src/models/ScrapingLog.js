const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ScrapingLog = sequelize.define('ScrapingLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'PENDING',
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pages_crawled: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  phones_extracted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  emails_extracted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'scraping_logs',
  timestamps: false,
});

module.exports = ScrapingLog;
