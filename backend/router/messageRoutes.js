const express = require('express');
const router = express.Router();
const messageController = require('../controller/messageController');
const authenticateJWT = require('../auth/refreshToken');
const { upload } = require('../middleware/uploadMiddleware');

// All routes require authentication
router.use(authenticateJWT);

// Get messages for a room
router.get('/room/:roomId', messageController.getRoomMessages);

// Send a message
router.post('/room/:roomId', messageController.createMessage);

// Delete a message
router.delete('/:messageId', messageController.deleteMessage);

// New route for sending messages with media
router.post('/room/:roomId/media', 
  authenticateJWT, 
  upload.single('file'), // Make sure this matches what your frontend is sending
  messageController.createMessageWithMedia
);

module.exports = router;