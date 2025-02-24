// models/deal.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const ContentCreator = require('./contentCreator');
const Company = require('./company');

const Deal = sequelize.define('Deal', {
  deal_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  budget: {
    type: DataTypes.INTEGER,
  },
  timeline: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'deals',
  timestamps: true,
});

module.exports = Deal;
