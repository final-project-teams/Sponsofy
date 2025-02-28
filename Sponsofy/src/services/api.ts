import api from '../config/axios';

export const chatService = {
  getMessages: async (chatId: string) => {
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  sendMessage: async (chatId: string, message: string) => {
    try {
      const response = await api.post(`/chats/${chatId}/messages`, { message });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadFile: async (chatId: string, file: FormData) => {
    try {
      const response = await api.post(`/chats/${chatId}/files`, file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const userService = {
  getProfile: async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const callService = {
  // Get call history
  getCallHistory: async () => {
    try {
      const response = await api.get('/calls/history');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Log a call
  logCall: async (callData: {
    calleeId: string;
    duration: number;
    callType: 'video' | 'audio';
    status: 'completed' | 'missed' | 'rejected';
  }) => {
    try {
      const response = await api.post('/calls/log', callData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Check if user is available for calls
  checkUserAvailability: async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}/availability`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};