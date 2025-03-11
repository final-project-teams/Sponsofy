// models/media.js
module.exports = (sequelize, DataTypes) => {
  const Media = sequelize.define('Media', {
    media_type: {
      type: DataTypes.ENUM('image', 'video', 'audio', 'document'),
      allowNull: false,
    },
    platform: {
      type: DataTypes.ENUM('instagram', 'facebook', 'tiktok', 'youtube'),
      allowNull: true, // Allow null for non-social media entries
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
    audience: {
      type: DataTypes.INTEGER,
    },
    views: {
      type: DataTypes.INTEGER,
    },
    likes: {
      type: DataTypes.INTEGER,
    },
    followers: {
      type: DataTypes.INTEGER,
    },
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'media',
    timestamps: true,
  });

  return Media;
};