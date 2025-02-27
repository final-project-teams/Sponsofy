// models/signature.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../connection');
module.exports =(sequelize, DataTypes) => {
const Signature = sequelize.define('Signature', {
  signature_data: {
    type: DataTypes.STRING,
    allowNull: false,  // Store the actual signature data (e.g., base64, URL, etc.)
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,  // When the signature was created
  },
}, {
  tableName: 'signatures',
  timestamps: false,  // No need for updatedAt for signature table
});
return Signature;
}
