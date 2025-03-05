const express = require('express');
const path = require('path');
require('dotenv').config();
const PORT = process.env.DB_PORT;
const { sequelize } = require('../database/connection');
const fs = require('fs');
const cors = require('cors');
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
const userRouter = require('../router/userRoutes');
const upload = require('../config/multer'); // Import Multer configuration

// Database initialization function
async function initializeDatabase() {
  try {
    await sequelize.sync({ alter: true }); // Sync database with models
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Add a small delay before seeding
    await seedDatabase(); // Seed the database
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Uncomment to initialize the database (use with caution in production)
// initializeDatabase();

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://192.168.1.10:5173'], // Allowed origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadDir));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/contract', contract);
app.use('/api/user', userRouter);

// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Socket.io setup
const chatNamespace = io.of('/chat');
chatNamespace.on('connection', (socket) => {
  console.log('A user connected to /chat');
  chatSocket(socket); // Use the chat socket logic
  socket.on('disconnect', () => {
    console.log('A user disconnected from /chat');
  });
});

const notificationNamespace = io.of('/notification');
notificationNamespace.on('connection', (socket) => {
  console.log('A user connected to /notification');
  notificationSocket(socket); // Use the notification socket logic
  socket.on('disconnect', () => {
    console.log('A user disconnected from /notification');
  });
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.emit('message', 'Welcome to the Socket.io server!'); // Send a welcome message
  socket.on('clientMessage', (msg) => {
    console.log('Message from client:', msg);
    socket.emit('message', `Server received: ${msg}`);
  });
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});

module.exports = { app, server, io };