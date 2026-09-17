const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PhoneNumber = sequelize.define('PhoneNumber', {
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
  number: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  normalized: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  phone_type: {
    type: DataTypes.STRING(20),
    defaultValue: 'MAIN',
  },
  source_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_whatsapp: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'phone_numbers',
  timestamps: false,
});

module.exports = PhoneNumber;
