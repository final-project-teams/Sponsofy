const { Message, User, Room, Media } = require('../database/connection');

const messageController = {
  createMessage: async (req, res) => {
    try {
      const { content } = req.body;
      const { roomId } = req.params;
      const userId = req.user.userId;

      // Verify user is part of the room
      const room = await Room.findOne({
        include: [{
          model: User,
          as: 'participants',
          where: { id: userId }
        }],
        where: { id: roomId }
      });

      if (!room) {
        return res.status(403).json({ error: 'Not authorized to send messages in this room' });
      }

      const message = await Message.create({
        content,
        roomId,
        userId
      });

      const messageWithUser = await Message.findByPk(message.id, {
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }]
      });

      res.status(201).json(messageWithUser);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Failed to create message' });
    }
  },

  getRoomMessages: async (req, res) => {
    try {
      const { roomId } = req.params;
      const userId = req.user.userId;

      // Verify user is part of the room
      const room = await Room.findOne({
        include: [{
          model: User,
          as: 'participants',
          where: { id: userId }
        }],
        where: { id: roomId }
      });

      if (!room) {
        return res.status(403).json({ error: 'Not authorized to view messages in this room' });
      }

      const messages = await Message.findAll({
        where: { roomId },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }],
        order: [['created_at', 'DESC']] // Most recent messages first
      });

      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  },

  deleteMessage: async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.user.userId;

      const message = await Message.findByPk(messageId);

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      if (message.userId !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this message' });
      }

      await message.destroy();
      res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ error: 'Failed to delete message' });
    }
  },

  createMessageWithMedia: async (req, res) => {
    try {
      const { roomId } = req.params;
      const { content } = req.body;
      const userId = req.user.userId;
      const files = req.files;

      // Verify user is part of the room
      const room = await Room.findOne({
        include: [{
          model: User,
          as: 'participants',
          where: { id: userId }
        }],
        where: { id: roomId }
      });

      if (!room) {
        return res.status(403).json({ error: 'Not authorized to send messages in this room' });
      }

      // Create the message
      const message = await Message.create({
        content,
        roomId,
        userId
      });

      // Create media entries for each uploaded file
      if (files && files.length > 0) {
        const mediaPromises = files.map(file => {
          return Media.create({
            media_type: file.mimetype.startsWith('image/') ? 'image' :
                       file.mimetype.startsWith('video/') ? 'video' :
                       file.mimetype.startsWith('audio/') ? 'audio' : 'document',
            file_url: file.path,
            file_name: file.originalname,
            file_size: file.size,
            file_format: file.mimetype,
            messageId: message.id
          });
        });

        await Promise.all(mediaPromises);
      }

      // Fetch the complete message with media and sender info
      const messageWithDetails = await Message.findOne({
        where: { id: message.id },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'first_name', 'last_name']
          },
          {
            model: Media
          }
        ]
      });

      res.status(201).json(messageWithDetails);
    } catch (error) {
      console.error('Error creating message with media:', error);
      res.status(500).json({ error: 'Failed to create message with media' });
    }
  }
};

module.exports = messageController;