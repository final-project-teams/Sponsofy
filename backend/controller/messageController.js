const { Message, User, Room } = require('../database/connection');
const { io } = require('../server/server'); 
const messageController = {
  // Get all messages for a specific room
  getMessages: async (req, res) => {
    try {
      const { roomId } = req.params;
      const messages = await Message.findAll({
        where: { RoomId: roomId },
        include: [
          {
            model: User,
            attributes: ['id', 'username']
          }
        ],
        order: [['created_at', 'DESC']]
      });
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Send a new message
  sendMessage: async (req, res) => {
    try {
      const { roomId } = req.params;
      const { content } = req.body;
      const userId = 1; // From JWT token

      const message = await Message.create({
        content,
        UserId: userId,
        RoomId: roomId,
        created_at: new Date()
      });

      const messageWithUser = await Message.findOne({
        where: { id: message.id },
        include: [
          {
            model: User,
            attributes: ['id', 'username']
          }
        ]
      });
      // Emit the new message to the room via Socket.io
      io.of('/chat').to(roomId).emit('newMessage', messageWithUser);
      res.status(201).json(messageWithUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = messageController;