import io from 'socket.io-client';

export const socketChat = io('http://localhost:3000/chat')
export const socketNotification = io('http://localhost:3000/notification')