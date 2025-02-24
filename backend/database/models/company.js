// models/company.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Media = require('./media');
const Deal = require('./deal');

const Company = sequelize.define('Company', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  industry: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'companies',
  timestamps: true,
});

module.exports = Company;
