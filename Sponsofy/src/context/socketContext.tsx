import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/source';
interface SocketContextType {
    chatSocket: typeof Socket | null;
    notificationSocket: typeof Socket | null;
    dealSocket: typeof Socket | null;

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

    useEffect(() => {
        const chatIO = io(`${SOCKET_URL}/chat`);
        const notificationIO = io(`${SOCKET_URL}/contract`);
        const dealIo=io(`${SOCKET_URL}/deal`);
        console.log('chatIOaaaaaaaaaaaaaaaaaaaaaa', `${SOCKET_URL}/deal`);
       
        

        setChatSocket(chatIO);
        setNotificationSocket(notificationIO);
        setDealSocket(dealIo)

        return () => {
            chatIO.disconnect();
            notificationIO.disconnect();
            dealSocket.disconnect();


        };
    }, []);

    return (
        <SocketContext.Provider value={{ chatSocket, notificationSocket,dealSocket }}>
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