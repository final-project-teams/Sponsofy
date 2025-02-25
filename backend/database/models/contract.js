// models/contract.js

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
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,  // Start date of the contract
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,  // End date of the contract
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'terminated'),
    defaultValue: 'active',  // Status of the contract
  },
  payment_terms: {
    type: DataTypes.TEXT,
    allowNull: true,  // Optional payment terms
  },
}, {
  tableName: 'contracts',
  timestamps: true,  // Automatically add createdAt and updatedAt columns
});
return Contract;
}
