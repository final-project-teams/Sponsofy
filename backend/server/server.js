const express = require('express');
const path = require('path');
require('dotenv').config();
const PORT = process.env.DB_PORT;
const { sequelize } = require('../database/connection');
const fs = require('fs');
const cors = require('cors');
const http = require('http');
const {Server} = require('socket.io');
const jwt = require('jsonwebtoken');
const app = express();
const seedDatabase = require('../database/seeders/seed');
const chatSocket = require('../socket/chat');
const notificationSocket = require('../socket/notification');
const notificationRouter = require('../router/NotificationRouter');
const contract = require('../router/contractrouter');
const searchRoutes = require('../router/searchrouter');
const ContentCreatorRouter = require('../router/ContentCreatorRouter');
const paymentRouter = require('../router/paymetnRouter');
const userRouter = require("../router/userRoutes")
const { initSocket } = require('../services/SocketService');






app.use(express.json());
const server = http.createServer(app);
initSocket(server);


// Socket.IO connection handling



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


// Use the search routes
app.use('/api/search', searchRoutes);
app.use('/api/contract', contract);
app.use('/api/contentcreator', ContentCreatorRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/search', searchRoutes);
app.use('/api/contract', contract);
app.use('/api/user', userRouter);
app.use('/api/notification', notificationRouter);
// Body parser middleware
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

// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});


// Socket.io setup
// Change app.listen to server.listen
// Start the server
server.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});

module.exports = { app, server };