// models/criteria.js


module.exports = (sequelize, DataTypes) => {
const Criteria = sequelize.define('Criteria', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,  // Name of the criterion (e.g., "Budget", "Timeline")
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,  // Optional description of the criterion
  },
}, {
  
  timestamps: true,  // Automatically add createdAt and updatedAt columns
});
return Criteria;
}