// models/transaction.js
module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending',
      },
      payment_method: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transaction_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      contentCreatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'content_creators',
          key: 'id',
        },
      },
      dealId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'deals',
          key: 'id',
        },
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'companies',
          key: 'id',
        },
      },
    }, {
      tableName: 'transactions',
      timestamps: true,
    });
  
    return Transaction;
  };