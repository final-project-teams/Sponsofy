const express = require('express');
const path = require('path');
require('dotenv').config();
const PORT = process.env.DB_PORT;
const { sequelize } = require('../database/connection');
const { Server } =require ("socket.io")
const fs = require('fs');
const cors = require('cors');
const app = express();
const http = require('http');
const seedDatabase = require('../database/seeders/seed');
const contract = require('../router/contractrouter');
const searchRoutes = require('../router/searchrouter');
const ContentCreatorRouter = require('../router/ContentCreatorRouter');
const paymentRouter = require('../router/paymetnRouter');
const userRouter = require("../router/userRoutes")
const { setupChatSocket } =require ("../sockets/chatSocket.js");
const { setupNotificationSocket } =require ("../sockets/notificationSocket.js");
const { setupRequestSocket } =require ("../sockets/requestSocket.js");

const server = http.createServer(app);
app.use(express.json());

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

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
// Setup different namespaces
const chatIO = io.of("/chat");
const notificationIO = io.of("/notification");
const requestIO = io.of("/request");

// Initialize socket handlers
setupChatSocket(chatIO);
setupNotificationSocket(notificationIO);
setupRequestSocket(requestIO);



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
server.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});

module.exports = {io, app, server };