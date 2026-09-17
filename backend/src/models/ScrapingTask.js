const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ScrapingTask = sequelize.define('ScrapingTask', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  task_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'PENDING',
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  keyword: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  search_radius: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  max_results: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  max_pages_per_site: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
  },
  required_fields: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
  },
  results_discovered: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  websites_found: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  websites_crawled: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  phones_found: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  emails_found: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  addresses_found: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  duplicates_removed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'scraping_tasks',
  timestamps: false,
});

module.exports = ScrapingTask;
