// models/deal.js

module.exports = (sequelize, DataTypes) => {
const Deal = sequelize.define('Deal', {
  content_creator_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  deal_terms: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,  // Deal price
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed'),
    defaultValue: 'pending',  // Status of the deal
  },
}, {
  tableName: 'deals',
  timestamps: true,  // Automatically add createdAt and updatedAt columns
});
return Deal
}
