import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/axios';
import { useSocket } from "../context/socketContext"

type AuthContextType = {
  user: any;
  token: string | null;
  loading: boolean;
  fetchCurrentUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { dealSocket, notificationSocket,contractSocket,chatSocket } = useSocket();

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          setToken(storedToken);
          await fetchCurrentUser();
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredData();
  }, []);

  // Effect to join deal room when user or dealSocket changes
  useEffect(() => {
    if (user && dealSocket) {
      console.log("Joining deal room with user ID:", user.id);
      dealSocket.emit("join_deal_room", user.id);
    }
    if (user && notificationSocket) {
      console.log("Joining notification room with user ID:", user.id);
      notificationSocket.emit("subscribe_notifications", user.id);
    }
    if (user && contractSocket) {
      console.log("Joining contract room with user ID:", user.id);
      contractSocket.emit("subscribe_contract", user.id);
      }
    if (user && chatSocket) {
      console.log("Joining chat room with user ID:", user.id);
      chatSocket.emit("init_user", user);
    }
  }, [user, dealSocket,notificationSocket,contractSocket,chatSocket]);

  const fetchCurrentUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (!storedToken) {
        console.log('No authentication token found');
        setUser(null);
        return;
      }
      
      const response = await api.get('/user/me');
      setUser(response.data.user);
      
      // Join deal room when user is fetched
      if (dealSocket && response.data.user) {
        console.log("Joining deal room with user ID:", response.data.user.id);
        dealSocket.emit("join_deal_room", response.data.user.id);
      }
      if (contractSocket && response.data.user) {
        console.log("Joining contract room with user ID:", response.data.user.id);
        contractSocket.emit("subscribe_contract", response.data.user.id);
      }

    } catch (error) {
      console.error('Error fetching current user:', error);
      if (error.response && error.response.status === 401) {
        console.log('Invalid or expired token, logging out');
        await logout();
      }
    }
  };

  const logout = async () => {
    try {
      // Leave deal room before logging out
      if (dealSocket && user) {
        console.log("Leaving deal room for user ID:", user.id);
        dealSocket.emit("leave_deal_room", user.id);
      }
      if (notificationSocket && user) {
        console.log("Leaving notification room for user ID:", user.id);
        notificationSocket.emit("leave_notification_room", user.id);
      }
      if (contractSocket && user) {
        console.log("Leaving contract room for user ID:", user.id);
        contractSocket.emit("leave_contract_room", user.id);
      }
      if (chatSocket && user) {
        console.log("Leaving chat room for user ID:", user.id);
        chatSocket.emit("leave_chat_room", user.id);
      }

      

      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};