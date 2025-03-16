module.exports = (sequelize, DataTypes) => {
  const UserRoom = sequelize.define('UserRoom', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    tableName: 'userrooms',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'roomId']
      }
    ]
  });
  
  return UserRoom;
};