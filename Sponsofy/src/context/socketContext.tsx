import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/source';
interface SocketContextType {
    chatSocket: Socket | null;
    notificationSocket: Socket | null;

}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [chatSocket, setChatSocket] = useState<Socket | null>(null);
    const [notificationSocket, setNotificationSocket] = useState<Socket | null>(null);
    const [requestSocket, setRequestSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const chatIO = io(`${SOCKET_URL}/chat`);
        const notificationIO = io(`${SOCKET_URL}/contract`);


        setChatSocket(chatIO);
        setNotificationSocket(notificationIO);


        return () => {
            chatIO.disconnect();
            notificationIO.disconnect();

        };
    }, []);

    return (
        <SocketContext.Provider value={{ chatSocket, notificationSocket }}>
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