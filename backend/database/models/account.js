// models/account.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../connection');
const ContentCreator = require('./contentCreator');
module.exports = (sequelize, DataTypes) => {
const Account = sequelize.define('Account', {
  platform: {
    type: DataTypes.ENUM('tiktok', 'youtube', 'instagram'),
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING, // The token for the platform (e.g., Instagram token)
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true, // Optional, for storing the username on that platform
  },
}, {
  
  timestamps: true,
});
return Account;
}
