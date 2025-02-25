// models/subCriteria.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../connection');  // Import the connection instance
const Criteria = require('./criteria');  // Import Criteria model
module.exports = (sequelize, DataTypes) => {
const SubCriteria = sequelize.define('SubCriteria', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,  // Name of the sub-criterion (e.g., "Budget Range", "Timeline Flexibility")
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,  // Optional description of the sub-criterion
  },

}, {
  
  timestamps: true,  // Automatically add createdAt and updatedAt columns
});
return SubCriteria;
}
