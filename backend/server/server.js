const express = require('express');
const path = require('path');
require('dotenv').config();
const PORT = process.env.DB_PORT || 3304;
const { sequelize } = require('../database/connection');
const fs = require('fs');
const cors = require("cors");
const http = require('http');
const socketIo = require('socket.io');
const companyRoutes = require('../router/companyRoutes');
const userRouter = require("../router/userRoutes");
const app = express();
const server = http.createServer(app);
const seedDatabase = require('../database/seeders/seed');
const chatSocket = require('../socket/chat');
const notificationSocket = require('../socket/notification');
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const contract = require('../router/contractrouter');
const searchRoutes = require('../router/searchrouter');



async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // Add alter:true option to avoid dropping tables
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
    
    // Add a small delay before seeding
    await new Promise(resolve => setTimeout(resolve, 1000));
    await seedDatabase();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Uncomment this to initialize the database
// initializeDatabase();

// CORS configuration - place this before any routes
app.use(cors({
  origin: '*', // Be more specific in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Use the search routes
app.use('/api/search', searchRoutes);
app.use('/api/contract', contract);
// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api/companies', companyRoutes);
app.use("/api/user", userRouter); // Fixed the path

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Important: Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

require('dotenv').config();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

// Root route

app.use("/api/user", userRouter)
app.get('/', (req, res) => {
  res.send('Sponsofy API Server');
});

// Socket.io setup
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

// Add this near the top of your server.js file
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Add a test endpoint to check connectivity
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});
