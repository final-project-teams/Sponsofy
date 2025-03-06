const express = require('express');
const path = require('path');
require('dotenv').config();
const PORT = process.env.DB_PORT;
const { sequelize } = require('../database/connection');
const fs = require('fs');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const seedDatabase = require('../database/seeders/seed');

const io = socketIo(server);
const {setupContract} = require('../socket/contractSetup');
const {chatSetup} = require('../socket/chat');
const contractRoutes = require('../router/contract.router');
const searchRoutes = require('../router/searchrouter');
// const ContentCreatorRouter = require('../router/ContentCreatorRouter');
const paymentRouter = require('../router/paymetnRouter');
const userRouter = require("../router/userRoutes")
const termsRouter = require("../router/termsrouter")
const dealRouter = require("../router/deal.router")




app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
app.use('/api/contract', contractRoutes);
// app.use('/api/contentcreator', ContentCreatorRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/search', searchRoutes);
// app.use('/api/contract', contract);
app.use('/api/user', userRouter);

// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use("/api/deal", dealRouter)




// sockettttttttttttttttt
const contractIo = io.of("/contract");
const chatIo = io.of("/chat");
chatSetup(chatIo);
setupContract(contractIo);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});


server.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});

module.exports = { app, server, io };