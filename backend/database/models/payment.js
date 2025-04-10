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
      defaultValue: 'USD',
    },
    status: {
      type: DataTypes.ENUM(
        'escrow_pending',
        'escrow_held',
        'escrow_released',
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
    },
    escrowHoldPeriod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 14, // Default 14 days hold period
      validate: {
        min: 1,    // Minimum 1 day
        max: 90    // Maximum 90 days
      }
    },
    escrowReleaseDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => {
        return new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)); // Default 14 days from now
      }
    }
  }, {
    tableName: 'payments',
    timestamps: true, // Automatically add createdAt and updatedAt columns
  });

  return Payment;
}; 