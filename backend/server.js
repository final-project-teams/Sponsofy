// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const path = require('path');
// const userRouter = require('../router/userRoutes');
// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST']
//   }
// });
// app.use('/api/users', userRouter);
// // Store active users
// const users = {};
// const rooms = {};

// io.on('connection', (socket) => {
//   const userId = socket.handshake.query.userId || socket.handshake.auth.userId;
//   console.log(`User connected: ${userId}`);
  
//   users[socket.id] = userId;
  
//   // Join a room
//   socket.on('join-room', (data) => {
//     const { roomId, userId } = data;
//     console.log(`User ${userId} joining room ${roomId}`);
    
//     socket.join(roomId);
    
//     if (!rooms[roomId]) {
//       rooms[roomId] = [];
//     }
    
//     rooms[roomId].push(socket.id);
    
//     // Notify other users in the room
//     socket.to(roomId).emit('user-joined', { userId });
//   });
  
//   // Leave a room
//   socket.on('leave-room', (data) => {
//     const { roomId, userId } = data;
//     console.log(`User ${userId} leaving room ${roomId}`);
    
//     socket.leave(roomId);
    
//     if (rooms[roomId]) {
//       rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
//     }
    
//     // Notify other users in the room
//     socket.to(roomId).emit('user-left', { userId });
//   });
  
//   // WebRTC signaling
//   socket.on('ice-candidate', (data) => {
//     const { roomId, candidate } = data;
//     socket.to(roomId).emit('ice-candidate', { candidate });
//   });
  
//   socket.on('offer', (data) => {
//     const { roomId, offer } = data;
//     socket.to(roomId).emit('offer', { offer });
//   });
  
//   socket.on('answer', (data) => {
//     const { roomId, answer } = data;
//     socket.to(roomId).emit('answer', { answer });
//   });
  
//   // Handle disconnection
//   socket.on('disconnect', () => {
//     const userId = users[socket.id];
//     console.log(`User disconnected: ${userId}`);
    
//     // Remove user from all rooms
//     for (const roomId in rooms) {
//       if (rooms[roomId].includes(socket.id)) {
//         rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
//         socket.to(roomId).emit('user-left', { userId });
//       }
//     }
    
//     delete users[socket.id];
//   });
// });

// const PORT = process.env.PORT || 3304;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// }); 