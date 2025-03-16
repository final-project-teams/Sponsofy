const { Message, User, Room, Media, sequelize } = require('../database/connection');
const { upload } = require('../middleware/uploadMiddleware');
const path = require('path');
const fs = require('fs');

// Helper function to create proper URLs for media files
const createMediaUrl = (filePath) => {
  if (!filePath) return null;
  
  console.log("Original file path:", filePath); // Debug log
  
  // Extract just the filename
  const fileName = path.basename(filePath);
  
  // Get the folder name (images, videos, etc.)
  const folderMatch = filePath.match(/uploads\/(images|videos|audio|misc)/);
  const folder = folderMatch ? folderMatch[1] : 'images';
  
  // Construct a URL that points to your static file server
  // Use the IP address from your app.json
  const url = `http://192.168.2.189:3304/uploads/${folder}/${fileName}`;
  
  console.log("Formatted URL:", url); // Debug log
  return url;
};

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

      // Get all messages for the room
      const messages = await Message.findAll({
        where: { roomId },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'first_name', 'last_name']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      // Get all media for these messages
      const messageIds = messages.map(m => m.id);
      const mediaRecords = await Media.findAll({
        where: { MessageId: messageIds }
      });

      // Create a map of media by message ID
      const mediaByMessageId = {};
      mediaRecords.forEach(media => {
        mediaByMessageId[media.MessageId] = {
          id: media.id,
          media_type: media.media_type,
          file_url: createMediaUrl(media.file_url),
          file_name: media.file_name,
          file_size: media.file_size,
          file_format: media.file_format
        };
      });

      // Attach media to messages
      const messagesWithMedia = messages.map(message => {
        const plainMessage = message.get({ plain: true });
        if (mediaByMessageId[message.id]) {
          plainMessage.Media = mediaByMessageId[message.id];
        }
        return plainMessage;
      });

      res.status(200).json(messagesWithMedia);
    } catch (error) {
      console.error('Error fetching messages with media:', error);
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
      const file = req.file; // Single file upload

      console.log("File received:", file); // Debug log

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

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
        content: content || 'Sent a file', // Default text if no content provided
        roomId,
        userId
      });

      console.log("Created message with ID:", message.id); // Debug log

      // Determine media type from mimetype
      let mediaType = 'document';
      if (file.mimetype.startsWith('image/')) {
        mediaType = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        mediaType = 'video';
      } else if (file.mimetype.startsWith('audio/')) {
        mediaType = 'audio';
      }

      // Use a direct SQL query to create the media record
      const [mediaRecord] = await sequelize.query(
        `INSERT INTO media (media_type, file_url, file_name, file_size, file_format, description, MessageId, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            mediaType,
            file.path,
            file.filename,
            file.size,
            file.mimetype,
            `Chat media in room ${roomId}`,
            message.id
          ],
          type: sequelize.QueryTypes.INSERT
        }
      );

      console.log("Created media record with ID:", mediaRecord); // Debug log

      // Create a custom response with the media information
      const response = {
        id: message.id,
        content: message.content,
        roomId: message.roomId,
        userId: message.userId,
        created_at: message.created_at,
        sender: {
          id: userId,
          username: req.user.username || 'User',
          first_name: req.user.first_name || 'User',
          last_name: req.user.last_name || ''
        },
        Media: {
          id: mediaRecord,
          media_type: mediaType,
          file_url: createMediaUrl(file.path),
          file_name: file.filename,
          file_size: file.size,
          file_format: file.mimetype
        }
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating message with media:', error);
      res.status(500).json({ 
        error: 'Failed to create message with media', 
        details: error.message,
        stack: error.stack
      });
    }
  }
};

module.exports = messageController;