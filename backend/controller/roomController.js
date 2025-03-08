const { Room, User, Message, UserRoom } = require('../database/connection');
const { Op } = require('sequelize');

const roomController = {
  createRoom: async (req, res) => {
    try {
      const currentUserId = req.user.userId;
      const { otherUserId } = req.body;

      if (!otherUserId) {
        return res.status(400).json({ error: 'Other user ID is required' });
      }

      // Check if users exist
      const users = await User.findAll({
        where: {
          id: [currentUserId, otherUserId]
        }
      });

      if (users.length !== 2) {
        return res.status(404).json({ error: 'One or both users not found' });
      }

      // Check if room already exists between these users
      const existingRoom = await Room.findOne({
        include: [{
          model: User,
          as: 'participants',
          where: {
            id: {
              [Op.in]: [currentUserId, otherUserId]
            }
          }
        }]
      });

      if (existingRoom) {
        const participantCount = await UserRoom.count({
          where: { roomId: existingRoom.id }
        });

        if (participantCount === 2) {
          return res.status(200).json(existingRoom);
        }
      }

      // Create new room
      const room = await Room.create({
        name: `room-${currentUserId}-${otherUserId}`,
      });

      // Add participants
      await UserRoom.bulkCreate([
        { userId: currentUserId, roomId: room.id },
        { userId: otherUserId, roomId: room.id }
      ]);

      // Fetch the room with participants
      const roomWithParticipants = await Room.findByPk(room.id, {
        include: [{
          model: User,
          as: 'participants',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }]
      });

      res.status(201).json(roomWithParticipants);
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(500).json({ 
        error: 'Failed to create room',
        details: error.message 
      });
    }
  },

  getUserRooms: async (req, res) => {
    try {
      const userId = req.user.userId;

      const rooms = await Room.findAll({
        include: [{
          model: User,
          as: 'participants',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }],
        where: {
          '$participants.id$': userId
        }
      });

      res.status(200).json(rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      res.status(500).json({ error: 'Failed to fetch rooms' });
    }
  },

  getRoomById: async (req, res) => {
    try {
      const { roomId } = req.params;
      const userId = req.user.userId;

      const room = await Room.findOne({
        where: { id: roomId },
        include: [
          {
            model: User,
            as: 'participants',
            attributes: ['id', 'username', 'first_name', 'last_name']
          },
          {
            model: Message,
            include: [{
              model: User,
              attributes: ['id', 'username', 'first_name', 'last_name']
            }],
            order: [['created_at', 'DESC']],
            limit: 50
          }
        ]
      });

      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      // Check if user is a participant
      const isParticipant = room.participants.some(p => p.id === userId);
      if (!isParticipant) {
        return res.status(403).json({ error: 'Not authorized to access this room' });
      }

      res.status(200).json(room);
    } catch (error) {
      console.error('Error fetching room:', error);
      res.status(500).json({ error: 'Failed to fetch room' });
    }
  }
};

module.exports = roomController;