const { DataTypes } = require('sequelize'); 


// Define the Contract model
module.exports = (sequelize, DataTypes) => {
  const Contract = sequelize.define('Contract', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,  // Title of the contract
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,  // Optional description for the contract
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'active', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'draft',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    criteriaId: {  // Change from CriterionId to criteriaId to match the association
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'criterias',
        key: 'id'
      }
    },
    payment_terms: {
      type: DataTypes.TEXT,
      allowNull: true,  // Optional payment terms
    },
    rank: {
      type: DataTypes.ENUM('plat', 'gold', 'silver'), // Define contract ranks
      allowNull: false,  // Rank must be specified
    },
  }, {
    tableName: 'contracts',
    timestamps: true,  // Automatically add createdAt and updatedAt columns
  });

  return Contract;
};