const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SourcePage = sequelize.define('SourcePage', {
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
  page_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  status_code: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scraped_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'source_pages',
  timestamps: false,
});

module.exports = SourcePage;
