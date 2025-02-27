module.exports = function(socket) {
  console.log('A user connected to the chat');
  
  // Join a chat room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Handle new message
  socket.on('send_message', async (data) => {
    try {
      const { roomId, message, userId } = data;
      console.log('New message:', { roomId, message, userId });
      
      // Broadcast the message to the room
      socket.to(roomId).emit('receive_message', {
        id: Date.now().toString(),
        content: message,
        UserId: userId,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  // Handle typing status
  socket.on('typing', ({ roomId, username }) => {
    socket.to(roomId).emit('user_typing', { username });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from chat');
  });
};