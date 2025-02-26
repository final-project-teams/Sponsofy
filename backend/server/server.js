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
const searchRoutes = require('../router/searchrouter');

const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

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

// Body parser middleware
app.use(express.json());
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

// Change app.listen to server.listen
server.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});

module.exports = { app, server, io };
