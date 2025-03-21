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
      type: DataTypes.ENUM(
        'escrow_pending',
        'escrow_held',
        'completed',
        'refunded',
        'failed'
      ),
      defaultValue: 'escrow_pending',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Assuming you have a User model
        key: 'id',
      },
    },
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'contracts',
        key: 'id',
      },
    },
    refundReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    releasedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'payments',
    timestamps: true, // Automatically add createdAt and updatedAt columns
  });

  return Payment;
}; 