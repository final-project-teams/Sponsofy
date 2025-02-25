// models/room.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../connection');
const ContentCreator = require('./contentCreator');  // Import ContentCreator model
const Company = require('./company');  // Import Company model
module.exports = (sequelize, DataTypes) => {
const Room = sequelize.define('Room', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,  // Each room must have a unique name (could be based on content creator and company ID)
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,  // Timestamp when the room was created
  },
}, {
  tableName: 'rooms',
  timestamps: false,  // No need for updatedAt for rooms table
});
return Room;
}
