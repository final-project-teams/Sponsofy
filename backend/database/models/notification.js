// models/notification.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../connection');  // Import the connection
const User = require('./user');  // Import User model
module.exports = (sequelize, DataTypes) => {
const Notification = sequelize.define('Notification', {
  message: {
    type: DataTypes.STRING,
    allowNull: false,  // The content of the notification
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,  // Type of notification (e.g., 'deal', 'contract', 'payment')
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,  // Default to unread
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,  // When the notification was created
  },

}, {
  tableName: 'notifications',
  timestamps: false,  // We don't need updatedAt for notifications
});
return Notification;
}