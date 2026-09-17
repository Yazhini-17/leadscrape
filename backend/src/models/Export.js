const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Export = sequelize.define('Export', {
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
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  format: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      isIn: [['EXCEL', 'PDF']],
    },
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  record_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  file_path: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'exports',
  timestamps: false,
});

module.exports = Export;
