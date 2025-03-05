const express = require('express');
const path = require('path');
require('dotenv').config();
const PORT = process.env.DB_PORT;
const { sequelize } = require('../database/connection');
const fs = require('fs');
const cors = require("cors");
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const app = express();
const server = http.createServer(app);
const seedDatabase = require('../database/seeders/seed');
const chatSocket = require('../socket/chat');
const notificationSocket = require('../socket/notification');
const io = socketIo(server);
const contract = require('../router/contractrouter');
const searchRoutes = require('../router/searchrouter');
const ContentCreatorRouter = require('../router/ContentCreatorRouter');
const paymentRouter = require('../router/paymetnRouter');
const userRouter = require("../router/userRoutes")
const termsRouter = require("../router/termsrouter")






app.use(express.json());

async function initializeDatabase() {
  try {
    // Add alter:true option to avoid dropping tables
    await sequelize.sync({ alter: true });
    // Add a small delay before seeding
    await new Promise(resolve => setTimeout(resolve, 1000));
    await seedDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// initializeDatabase();

// CORS configuration - place this before any routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow both ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));


// Use the search routes
app.use('/api/search', searchRoutes);
app.use('/api/contract', contract);
app.use('/api/contentcreator', ContentCreatorRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/terms', termsRouter(io));
// Body parser middleware
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Important: Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

require('dotenv').config();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});


app.use("/api/user", userRouter)
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Create a namespace for /chat
const chatNamespace = io.of('/chat');
chatNamespace.on('connection', (socket) => {
  console.log('A user connected to /chat');
  // Use the chat socket logic
  chatSocket(socket);

  // When the user disconnects
  socket.on('disconnect', () => {
    console.log('A user disconnected from /chat');
  });
});

// Create a namespace for /notification
const notificationNamespace = io.of('/notification');
notificationNamespace.on('connection', (socket) => {
  console.log('A user connected to /notification');
  // Use the notification socket logic
  notificationSocket(socket);

  // When the user disconnects
  socket.on('disconnect', () => {
    console.log('A user disconnected from /notification');
  });
});

io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Send a welcome message to the client
  socket.emit('message', 'Welcome to the Socket.io server!');

  // Listen for a message from the client
  socket.on('clientMessage', (msg) => {
    console.log('Message from client:', msg);
    socket.emit('message', `Server received: ${msg}`);
  });

  // When the user disconnects
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});


// Change app.listen to server.listen
server.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});

module.exports = { app, server, io };
