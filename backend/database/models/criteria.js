module.exports = (sequelize, DataTypes) => {
  const Criteria = sequelize.define('Criteria', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    platform: {
      type: DataTypes.ENUM('instagram', 'facebook', 'twitter', 'tiktok', 'youtube'),
      allowNull: false,
    },
  }, {
    tableName: 'criterias',
    timestamps: true,
  });

  return Criteria;
};