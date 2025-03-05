// models/contentCreator.js

module.exports = (sequelize, DataTypes) => {
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
  category: {
      type: DataTypes.STRING,
      allowNull: true
    },
  verified: {
    type: DataTypes.BOOLEAN,
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
  },
}, {
  tableName: 'content_creators',
  timestamps: true,
});
return ContentCreator;
}
