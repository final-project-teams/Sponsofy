const socketIO = require('socket.io');

let io;

/**
 * Initialize Socket.IO
 * @param {object} server - HTTP server instance
 */
const initSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Allow frontend to connect
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
        });
    });
};

/**
 * Emit an event to a specific user
 * @param {string} userId - The ID of the user to notify
 * @param {string} event - Event name
 * @param {object} data - Data to send
 */
const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(userId).emit(event, data);
    }
};

module.exports = { initSocket, emitToUser };