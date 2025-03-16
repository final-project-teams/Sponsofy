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
  const { dealSocket } = useSocket();

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
  }, [user, dealSocket]);

  const fetchCurrentUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (!storedToken) {
        console.log('No authentication token found');
        setUser(null);
        return;
      }
      
      const response = await api.get('/user/me');
      
      // Ensure we have a consistent user object with an id field
      const userData = response.data.user;
      
      // Make sure we have a consistent id field (some APIs use Id, some use id)
      if (userData) {
        if (userData.Id && !userData.id) {
          userData.id = userData.Id;
        } else if (userData.id && !userData.Id) {
          userData.Id = userData.id;
        }
        
        setUser(userData);
        
        // Join deal room when user is fetched
        if (dealSocket && userData) {
          console.log("Joining deal room with user ID:", userData.id);
          dealSocket.emit("join_deal_room", userData.id);
        }
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