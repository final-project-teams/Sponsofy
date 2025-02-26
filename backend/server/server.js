const express = require('express');
const path = require('path');
require('dotenv').config();
const PORT = process.env.DB_PORT;

const cors = require("cors");
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const jwt = require('jsonwebtoken');

// Import routes
const companyRoutes = require('../router/companyRoutes');

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// CORS configuration
app.use(cors({
  origin: '*', // Be more specific in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Static files
const uploadDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api', companyRoutes); // Mount company routes under /api

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

// Database initialization
// async function initializeDatabase() {
//   try {
//     await sequelize.sync({ alter: true });
//     console.log('Database synchronized successfully');
//   } catch (error) {
//     console.error('Database synchronization failed:', error);
//   }
// }

// initializeDatabase();

// Use a very simple secret
const JWT_SECRET = 'your-super-secret-key-123';

// Add login endpoint to get token
app.post('/api/login', (req, res) => {
  // For testing purposes, create a test user
  const testUser = {
    id: 2,
    email: 'test@example.com'
  };

  try {
    const token = jwt.sign(testUser, JWT_SECRET);
    console.log('Generated token:', token);
    res.json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Add test endpoint
app.get('/api/verify-token', (req, res) => {
  const authHeader = req.header('Authorization');
  console.log('Verify token header:', authHeader);

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, error: error.message });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});

module.exports = { app, server, io };
