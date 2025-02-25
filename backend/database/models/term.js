// models/term.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../connection');
const Deal = require('./deal');  // Import the Deal model
module.exports = (sequelize, DataTypes) => {
const Term = sequelize.define('Term', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,  // Title of the term (e.g., "Payment Term", "Delivery Time")
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,  // Optional description of the term
  },
  status: {
    type: DataTypes.ENUM('active', 'negotiating', 'accepted'),
    defaultValue: 'negotiating',  // Status of the term
  },
}, {
  tableName: 'terms',
  timestamps: true,  // Automatically add createdAt and updatedAt columns
});
return Term;
}
