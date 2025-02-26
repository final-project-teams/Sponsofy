// sockets/chat.js
module.exports = function(socket) {
    console.log('A user connected to the chat');
    
    // Handle chat message event
    socket.on('chatMessage', (msg) => {
      console.log('Chat message received:', msg);
      // Emit message to all connected clients
      socket.broadcast.emit('message', `New chat message: ${msg}`);
    });
  
    // When the user disconnects from chat
    socket.on('disconnect', () => {
      console.log('A user disconnected from the chat');
    });
  };
  