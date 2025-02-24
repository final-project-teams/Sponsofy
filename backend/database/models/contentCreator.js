// models/contentCreator.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Media = require('./media');

const ContentCreator = sequelize.define('ContentCreator', {
  first_name: {
    type: DataTypes.STRING,
  },
  last_name: {
    type: DataTypes.STRING,
  },
  bio: {
    type: DataTypes.TEXT,
  },
  pricing: {
    type: DataTypes.STRING,
  },
  portfolio_links: {
    type: DataTypes.TEXT,
  },
  location: {
    type: DataTypes.STRING,
  },
  verified: {
    type: DataTypes.BOOLEAN,
  },
  profile_picture_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Media,
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
}, {
  tableName: 'content_creators',
  timestamps: true,
});

module.exports = ContentCreator;
