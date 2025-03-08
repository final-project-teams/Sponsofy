const express = require('express');
const router = express.Router();
const roomController = require('../controller/roomController');
const authenticateJWT = require('../auth/refreshToken');

// All routes require authentication
router.use(authenticateJWT);

// Create a new room
router.post('/', roomController.createRoom);

// Get all rooms for the authenticated user
router.get('/my-rooms', roomController.getUserRooms);

// Get specific room by ID
router.get('/:roomId', roomController.getRoomById);

module.exports = router;