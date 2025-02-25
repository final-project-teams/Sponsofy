// models/account.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../connection');
const ContentCreator = require('./contentCreator');
module.exports = (sequelize, DataTypes) => {
const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  platform: {
    type: DataTypes.ENUM('tiktok', 'youtube', 'instagram'),
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING, // The token for the platform (e.g., Instagram token)
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true, // Optional, for storing the username on that platform
  },
  content_creator_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'content_creators',
      key: 'id'
    }
  }
}, {
  
  timestamps: true,
  tableName: 'accounts',
  underscored: true
});
return Account;
}
