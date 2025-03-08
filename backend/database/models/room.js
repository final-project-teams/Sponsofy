// models/room.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../connection');
const ContentCreator = require('./contentCreator');  // Import ContentCreator model
const Company = require('./company');  // Import Company model
module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'rooms',
    timestamps: false,
  });

  return Room;
};
