// models/message.js
module.exports = (sequelize, DataTypes) => {
const Message = sequelize.define('Message', {
  content: {
    type: DataTypes.STRING,
    allowNull: false,  // The content of the message
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,  // When the message was sent
  },
}, {
  tableName: 'messages',
  timestamps: false,  // No need for updatedAt for messages table
});
return Message;
}
