module.exports = (sequelize, DataTypes) => {
    const ContentCreatorSubCriteria = sequelize.define(
      "ContentCreatorSubCriteria",
      {
        // The foreign keys will be added automatically by Sequelize
        // You can add additional fields here if needed
        value: {
          type: DataTypes.STRING,
          allowNull: true,
          comment: "Optional value for the subcriteria (e.g., specific budget amount, preference value)",
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: "Any additional notes about this specific association",
        },
      },
      {
        tableName: "creator_sub",
        timestamps: true,
        indexes: [
          // Adding an index to improve query performance
          {
            unique: true,
            fields: ["contentCreatorId", "subCriteriaId"],
          },
        ],
      },
    )
  
    return ContentCreatorSubCriteria
  }
  
  