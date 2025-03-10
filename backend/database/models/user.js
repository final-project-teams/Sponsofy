// models/user.js

module.exports = (sequelize, DataTypes) => { 
  const User = sequelize.define('User', {
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('content_creator', 'company'),
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
    },
    isPremium: {
      type: DataTypes.BOOLEAN,
    },
  }, {
    tableName: 'users',
    timestamps: true,
  });
  return User;
}
