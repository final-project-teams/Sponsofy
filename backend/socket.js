// // index.js
// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');

// // Create an Express app
// const app = express();

// // Create an HTTP server using the Express app
// const server = http.createServer(app);

// // Set up socket.io on the server
// const io = socketIo(server);

// // Serve static files from the 'public' folder (optional)
// app.use(express.static('public'));

// // When a client connects to the server
// io.on('connection', (socket) => {
//   console.log('A user connected');
  
//   // Send a welcome message to the client
//   socket.emit('message', 'Welcome to the Socket.io server!');

//   // Listen for a message from the client
//   socket.on('clientMessage', (msg) => {
//     console.log('Message from client:', msg);
//     socket.emit('message', `Server received: ${msg}`);
//   });

//   // When the user disconnects
//   socket.on('disconnect', () => {
//     console.log('A user disconnected');
//   });
// });

// // Set up a simple route
// app.get('/', (req, res) => {
//   res.send('Hello, welcome to the Socket.io Express app!');
// });

// // Start the server
// const PORT =  4000
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
