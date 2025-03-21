import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/source';

interface SocketContextType {
    chatSocket: Socket | null;
    notificationSocket: Socket | null;
    dealSocket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [chatSocket, setChatSocket] = useState<Socket | null>(null);
    const [notificationSocket, setNotificationSocket] = useState<Socket | null>(null);
    const [dealSocket, setDealSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        console.log('Connecting to socket server at:', `${SOCKET_URL}/chat`);

        // Initialize sockets
        const chatIO = io(`${SOCKET_URL}/chat`, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket', 'polling']
        });

        const notificationIO = io(`${SOCKET_URL}/contract`, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket', 'polling']
        });

        const dealIO = io(`${SOCKET_URL}/deal`, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket', 'polling']
        });

        // Set up event listeners for chat socket
        chatIO.on('connect', () => {
            console.log('Chat socket connected');
            setIsConnected(true);
        });

        chatIO.on('disconnect', () => {
            console.log('Chat socket disconnected');
            setIsConnected(false);
        });

        chatIO.on('connect_error', (error) => {
            console.error('Chat socket connection error:', error);
            setIsConnected(false);
        });

        // Set the sockets in state
        setChatSocket(chatIO);
        setNotificationSocket(notificationIO);
        setDealSocket(dealIO);

        // Cleanup function
        return () => {
            console.log('Cleaning up socket connections');
            if (chatIO) chatIO.disconnect();
            if (notificationIO) notificationIO.disconnect();
            if (dealIO) dealIO.disconnect();
        };
    }, []);

    const value = {
        chatSocket,
        notificationSocket,
        dealSocket,
        isConnected
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = (): SocketContextType => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};