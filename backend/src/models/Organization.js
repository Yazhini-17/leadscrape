const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Organization = sequelize.define('Organization', {
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
  name: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  street: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  area: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  address_source: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  confidence_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
  confidence_level: {
    type: DataTypes.STRING(10),
    defaultValue: 'LOW',
  },
  source: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  is_duplicate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'organizations',
  timestamps: false,
});

module.exports = Organization;
