
module.exports = (sequelize, DataTypes) => {
    const DealRequest = sequelize.define('DealRequest', {
      message: {
        type: DataTypes.STRING,
        allowNull: false,  // The content of the notification
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed'),
        defaultValue: 'pending',  // Status of the deal
      },
    
    }, {
      tableName: 'deal_requests',
      timestamps: true,  // We don't need updatedAt for notifications
    });
    return DealRequest;
    
    }