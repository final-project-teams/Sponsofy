import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/source';
interface SocketContextType {
    chatSocket: typeof Socket | null;
    notificationSocket: typeof Socket | null;
    dealSocket: typeof Socket | null;
    contractSocket: typeof Socket | null;
   
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [chatSocket, setChatSocket] = useState<typeof Socket | null>(null);
    const [notificationSocket, setNotificationSocket] = useState<typeof Socket | null>(null);
    const [requestSocket, setRequestSocket] = useState<typeof Socket | null>(null);
    const [dealSocket, setDealSocket] = useState<typeof Socket | null>(null);
    const [contractSocket, setContractSocket] = useState<typeof Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

  

    useEffect(() => {
        // const chatIO = io(`${SOCKET_URL}/chat`);
        // const notificationIO = io(`${SOCKET_URL}/contract`);
        const dealIo=io(`${SOCKET_URL}/deal`);
        const contractIo=io(`${SOCKET_URL}/contract`);
        
        console.log('chatIOaaaaaaaaaaaaaaaaaaaaaa', `${SOCKET_URL}/deal`);
        console.log('contractIooooooooooo',`${SOCKET_URL}/contract`);
       
        

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
        setContractSocket(contractIo);

        // Cleanup function
        return () => {
            chatIO.disconnect();
            notificationIO.disconnect();
            dealIo.disconnect();
            contractIo.disconnect();      
        };
    }, []);

    const value = {
        chatSocket,
        notificationSocket,
        dealSocket,
        contractSocket,
        isConnected
    };

    return (
        <SocketContext.Provider value={{ chatSocket, notificationSocket,dealSocket,contractSocket }}>
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