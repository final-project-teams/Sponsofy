// models/negotiation.js

module.exports = (sequelize, DataTypes) => {
const Negotiation = sequelize.define('Negotiation', {
  message: {
    type: DataTypes.TEXT,
    allowNull: true,  // Message or update related to the negotiation
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
    defaultValue: 'pending',  // Status of the negotiation
  },
  confirmation_company: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,  // Whether the negotiation is confirmed
  },
  confirmation_Influencer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,  // Whether the negotiation is confirmed
  },

}, {
  tableName: 'negotiations',
  timestamps: true,  // Automatically add createdAt and updatedAt columns
});
return Negotiation;
}
