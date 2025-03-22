module.exports = (sequelize, DataTypes) => {
  const SubCriteria = sequelize.define(
    "SubCriteria",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false, // Name of the sub-criterion (e.g., "Budget Range", "Timeline Flexibility")
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true, // Optional description of the sub-criterion
      },
    },
    {
      tableName: "sub_criterias", // Ensure this matches the actual table name
      timestamps: true, // Automatically add createdAt and updatedAt columns
    },
  )

  return SubCriteria
}

