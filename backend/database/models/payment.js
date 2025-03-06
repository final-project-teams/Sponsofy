const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    paymentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Unique payment ID from Stripe
    },
    amount: {
      type: DataTypes.INTEGER, // Store amount in cents
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('succeeded', 'pending', 'failed'),
      defaultValue: 'pending',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Assuming you have a User model
        key: 'id',
      },
    },
  }, {
    tableName: 'payments',
    timestamps: true, // Automatically add createdAt and updatedAt columns
  });

  return Payment;
}; 