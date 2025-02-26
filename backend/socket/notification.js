// sockets/notification.js
module.exports = function(socket) {
    console.log('A user connected to notifications');
    
    // Send a notification event
    socket.emit('notification', 'You have a new notification!');
  
    // Listen for custom notifications from client
    socket.on('sendNotification', (data) => {
      console.log('Notification received:', data);
      // Broadcast the notification to other users
      socket.broadcast.emit('notification', `Notification: ${data.message}`);
    });
  
    // When the user disconnects from notifications
    socket.on('disconnect', () => {
      console.log('A user disconnected from notifications');
    });
  };
  