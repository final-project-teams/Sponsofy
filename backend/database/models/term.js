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
    allowNull: false,  // Optional description of the term
  },
  companyAccepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  influencerAccepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',  // Status of the term
  },
  ContractId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'terms',
  timestamps: true,  // Automatically add createdAt and updatedAt columns
});
return Term;
}
