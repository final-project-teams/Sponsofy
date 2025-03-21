// models/post.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../connection');
const Account = require('./account');
const Media = require('./media');  // Assuming Media exists, it may contain images/videos for the posts
module.exports = (sequelize, DataTypes) => {
const Post = sequelize.define('Post', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,  // Title is required
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,  // Body is required
  },
  platform: {
    type: DataTypes.ENUM('tiktok', 'youtube', 'instagram'),
    allowNull: false,  // Platform is required
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'pending'),
    defaultValue: 'draft',  // Default to draft
  },
}, {
  tableName: 'posts',
  timestamps: true,  // Automatically add createdAt and updatedAt columns
});
return Post;
}
