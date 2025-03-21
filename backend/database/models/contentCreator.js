module.exports = (sequelize, DataTypes) => {
  const ContentCreator = sequelize.define(
    "ContentCreator",
    {
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
        allowNull: true,
      },
      verified: {
        type: DataTypes.BOOLEAN,
      },
      isPremium: {
        type: DataTypes.BOOLEAN,
      },
      profile_picture: {
        type: DataTypes.STRING, // Storing the image URL or file path
        allowNull: true,
      },
    },
    {
      tableName: "content_creators",
      timestamps: true,
    },
  )

  return ContentCreator
}

