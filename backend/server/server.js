const express = require('express');
const path = require('path');
require('dotenv').config();
const PORT = process.env.DB_PORT;
const { sequelize } = require('../database/connection');
const { Server } = require("socket.io");
const fs = require('fs');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const seedDatabase = require('../database/seeders/seed');
const server = http.createServer(app);
const io = socketIo(server);
const { setupContractSocket } = require('../socket/contractSetup');
const { setupNotifications } = require('../socket/notificationSetup');
const { setupDealSocket } = require('../socket/dealSetUp'); // Import the deal socket setup
const { setupChat } = require('../socket/chatSetup'); // Import the chat socket setup


const contractRoutes = require('../router/contract.router');
const searchRoutes = require('../router/searchrouter');
// const ContentCreatorRouter = require('../router/ContentCreatorRouter');
const paymentRouter = require('../router/paymetnRouter');
const userRouter = require("../router/userRoutes")
const termsRouter = require("../router/termsrouter")
const dealRouter = require("../router/deal.router")
const roomRoutes = require('../router/roomRoutes');
const messageRoutes = require('../router/messageRoutes');

const transactionRouter = require('../router/transaction.router');
const cardPaymentRoutes = require("../router/cardPaymentRoutes");
const signatureRouter = require('../router/signatureRouter');
const QRCodeVerifierRouter = require('../router/QRCodeVerifierRouter');const contracts=require("../router/contract")
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')))
console.log(path.join(__dirname, 'uploads'))




app.use(express.urlencoded({ extended: true }));
app.use(express.json());
async function initializeDatabase() {
  try {
    // Comment out this line since synchronization is now handled in database/connection.js
    // await sequelize.sync({ alter: true }); // Sync database with models
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Add a small delay before seeding
    await seedDatabase(); // Seed the database
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

app.use(
  cors({
    origin: "*", // Allow all origins - for development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
  })
);

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

// Use the search routes
app.use('/api/search', searchRoutes);
app.use('/api/contract', contractRoutes);
// app.use('/api/contentcreator', ContentCreatorRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/search', searchRoutes);
// app.use('/api/contract', contract);
app.use('/api/user', userRouter);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/signature', signatureRouter);
app.use('/api/qr', QRCodeVerifierRouter);
app.use('/api/contracts', contracts);

app.use('/api/transactions', transactionRouter);
app.use("/api", cardPaymentRoutes);


// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use("/api/deal", dealRouter)


// Add this to your server.js file
// const express = require('express');
// const path = require('path');
// const cors = require('cors');

// Enable CORS for all routes
app.use(cors());

// Create a dedicated route for serving static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add a test endpoint to check if images are accessible
app.get('/test-image', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Image Test</h1>
        <p>If you can see an image below, your static file server is working:</p>
        <img src="/uploads/images/file-1741623016694-545084615.jpg" alt="Test Image" style="max-width: 300px;" />
      </body>
    </html>
  `);
});

// Add this to your server.js file
// const express = require('express');
// const path = require('path');
// const cors = require('cors');

// Enable CORS for all routes
app.use(cors());

// Create a dedicated route for serving static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add a test endpoint to check if images are accessible
app.get('/test-image', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Image Test</h1>
        <p>If you can see an image below, your static file server is working:</p>
        <img src="/uploads/images/file-1741623016694-545084615.jpg" alt="Test Image" style="max-width: 300px;" />
      </body>
    </html>
  `);
});


// sockettttttttttttttttt
const contractIo = io.of("/contract");
const chatIo = io.of("/chat");


setupContractSocket(contractIo);
setupNotifications(io);
setupDealSocket(io); // Set up the deal socket
setupChat(io); // Set up the chat socket


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});


server.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});

module.exports = { app, server };
module.exports = {io, app, server };