// models/media.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const ContentCreator = require('./contentCreator');
const Deal = require('./deal');
const Company = require('./company');

const Media = sequelize.define('Media', {
  media_type: {
    type: DataTypes.ENUM('image', 'video', 'audio', 'document'),
    allowNull: false,
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_size: {
    type: DataTypes.INTEGER,
  },
  file_format: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'media',
  timestamps: true,
});

module.exports = Media;
