const path = require('path');
// const axios = require('axios');



// Chat service functions - these will call your API endpoints instead of directly using Sequelize


const setupChat = (io) => {
  const chatIo = io.of('/chat');

  // Store active users and their rooms
  const activeUsers = new Map(); // socketId -> { userId, username }
  const roomUsers = new Map(); // roomId -> Set of userIds

  chatIo.on('connection', (socket) => {
    console.log('User connected to chat:', socket.id);

    // User authentication/initialization
    socket.on('init_user', (userData) => {
        //   const { userId: userData.id, username } = userData;
        const userId = userData.id;
        const username = userData.username;
      activeUsers.set(socket.id, { userId, username });
      socket.emit('init_success', { socketId: socket.id });
    });

    // Join a room
    socket.on('join_room', async ({ roomId, userId }) => {
      try {
        socket.join(roomId);
        
        // Add user to room tracking
        if (!roomUsers.has(roomId)) {
          roomUsers.set(roomId, new Set());
        }
        roomUsers.get(roomId).add(userId);

        // Get active users in the room
        const roomActiveUsers = Array.from(roomUsers.get(roomId)).map(id => {
          for (const [socketId, user] of activeUsers.entries()) {
            if (user.userId === id) {
              return { ...user, socketId };
            }
          }
        }).filter(Boolean);

        // Notify others in the room
        socket.to(roomId).emit('user_joined', {
          userId,
          socketId: socket.id,
          roomId
        });

        // Send room info to the joining user
        socket.emit('room_joined', {
          roomId,
          activeUsers: roomActiveUsers
        });

      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave a room
    socket.on('leave_room', ({ roomId, userId }) => {
      socket.leave(roomId);
      
      // Remove user from room tracking
      if (roomUsers.has(roomId)) {
        roomUsers.get(roomId).delete(userId);
        if (roomUsers.get(roomId).size === 0) {
          roomUsers.delete(roomId);
        }
      }

      // Notify others
      socket.to(roomId).emit('user_left', {
        userId,
        socketId: socket.id,
        roomId
      });
    });

    // Handle new message
    socket.on('new_message', (messageData) => {
      const { roomId } = messageData;
      
      // Add sender info to the message
      const sender = activeUsers.get(socket.id);
      const enrichedMessage = {
        ...messageData,
        sender: {
          id: messageData.userId || sender.userId,  // Use the provided userId or fallback to socket's user
          username: sender.username,
          first_name: messageData.sender?.first_name || '',
          last_name: messageData.sender?.last_name || ''
        },
        created_at: new Date().toISOString(),
        socketId: socket.id
      };

      // Broadcast to everyone in the room including sender
      chatIo.to(roomId).emit('receive_message', enrichedMessage);
    });

    // Handle message with media
    socket.on('new_message_with_media', async (messageData) => {
      const { roomId } = messageData;
      
      // Get sender info from socket or messageData
      const socketUser = activeUsers.get(socket.id);
      const enrichedMessage = {
        ...messageData,
        sender: messageData.sender || {  // Use provided sender info or fallback to socket user
          id: socketUser?.userId,
          username: socketUser?.username,
          first_name: '',
          last_name: ''
        },
        created_at: new Date().toISOString(),
        socketId: socket.id
      };

      // Immediately broadcast to all users in the room
      chatIo.to(roomId).emit('receive_message', enrichedMessage);

      // Also emit a specific event for media messages
      chatIo.to(roomId).emit('receive_media_message', enrichedMessage);
    });

    // Handle typing indicators
    socket.on('typing_start', ({ roomId }) => {
      const user = activeUsers.get(socket.id);
      if (user) {
        socket.to(roomId).emit('user_typing', {
          userId: user.userId,
          username: user.username,
          socketId: socket.id
        });
      }
    });

    socket.on('typing_end', ({ roomId }) => {
      const user = activeUsers.get(socket.id);
      if (user) {
        socket.to(roomId).emit('user_stopped_typing', {
          userId: user.userId,
          socketId: socket.id
        });
      }
    });

    // Handle message reactions
    socket.on('add_reaction', ({ roomId, messageId, reaction }) => {
      const user = activeUsers.get(socket.id);
      if (user) {
        chatIo.to(roomId).emit('message_reaction', {
          messageId,
          reaction,
          userId: user.userId,
          username: user.username
        });
      }
    });

    // Handle message deletion
    socket.on('delete_message', ({ roomId, messageId }) => {
      console.log('Received delete_message event:', { roomId, messageId });
      
      // Verify the sender is in the room
      const user = activeUsers.get(socket.id);
      if (!user) {
        console.error('User not found for socket:', socket.id);
        return;
      }

      if (!roomUsers.has(roomId) || !roomUsers.get(roomId).has(user.userId)) {
        console.error('User not in room:', { userId: user.userId, roomId });
        return;
      }

      // Broadcast deletion to all users in the room
      console.log('Broadcasting message_deleted event to room:', roomId);
      chatIo.to(roomId).emit('message_deleted', { messageId });
    });

    // Handle message editing
    socket.on('edit_message', ({ roomId, messageId, newContent }) => {
      const user = activeUsers.get(socket.id);
      if (user) {
        chatIo.to(roomId).emit('message_edited', {
          messageId,
          newContent,
          editedBy: {
            userId: user.userId,
            username: user.username
          },
          editedAt: new Date()
        });
      }
    });

    // Handle read receipts
    socket.on('mark_read', ({ roomId, messageId }) => {
      const user = activeUsers.get(socket.id);
      if (user) {
        socket.to(roomId).emit('message_read', {
          messageId,
          userId: user.userId,
          username: user.username,
          readAt: new Date()
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        // Remove user from all rooms they were in
        for (const [roomId, users] of roomUsers.entries()) {
          if (users.has(user.userId)) {
            users.delete(user.userId);
            chatIo.to(roomId).emit('user_left', {
              userId: user.userId,
              socketId: socket.id,
              roomId
            });
          }
        }
        // Clean up empty rooms
        for (const [roomId, users] of roomUsers.entries()) {
          if (users.size === 0) {
            roomUsers.delete(roomId);
          }
        }
        // Remove from active users
        activeUsers.delete(socket.id);
      }
      console.log('User disconnected from chat:', socket.id);
    });
  });
};

module.exports = { setupChat };
