const express = require('express');
const router = express.Router();
const messageController = require('../controller/messageController');
const authenticateJWT = require('../auth/refreshToken');

// Get messages for a specific room
router.get('/rooms/:roomId/messages', messageController.getMessages);

// Send a message to a specific room
router.post('/rooms/:roomId/messages', messageController.sendMessage);

module.exports = router;