// models/room.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../connection');
const ContentCreator = require('./contentCreator');  // Import ContentCreator model
const Company = require('./company');  // Import Company model

module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'rooms',
    timestamps: true,  // This will add created_at and updated_at
    underscored: true  // This will make createdAt -> created_at
  });

  return Room;
};
