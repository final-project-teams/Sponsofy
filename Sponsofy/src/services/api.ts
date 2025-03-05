import api from '../config/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      console.log("response",response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
export const contractService = {
  getContracts: async () => {
    try {
      const response = await api.get('/contract');
      console.log("response",response.data);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createContract: async (contractData: any) => {
    try {
      const response = await api.post('/contracts', contractData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateContract: async (contractId: string, contractData: any) => {
    try {
      const response = await api.put(`/contracts/${contractId}`, contractData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteContract: async (contractId: string) => {
    try {
      const response = await api.delete(`/contracts/${contractId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const searchService = {
  searchCompanies: async (query: string) => {
    try {
      const response = await api.get(`/search/companies?query=${query}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  searchContentCreators: async (query: string) => {
    try {
      const response = await api.get(`/search/content-creators?query=${query}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  searchContracts: async (query: string, rank?: string) => {
    try {
      const response = await api.get(`/search/contracts?query=${query}${rank ? `&rank=${rank}` : ''}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  searchContractsByRank: async (rank: string) => {
    try {
      const response = await api.get(`/search/contracts/rank?rank=${rank}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  

};
export const contentCreatorService = {
  getContentCreators: async () => {
    const response = await api.get('/contentcreator');
    return response.data;
  },
  getContentCreatorById: async (id: string) => {
    const response = await api.get(`/contentcreator/${id}`);
    return response.data;
  },
  createContentCreator: async (contentCreator: any) => {
    const response = await api.post('/contentcreator', contentCreator);
    return response.data;
  }
  
};
export const paymentService = {
  async createPaymentIntent(amount: number, tokenToUse: string) {
    try {
      const response = await api.post(
        '/payment/create-payment-intent',
        { amount }, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': tokenToUse
          }
        }
      );
      
      console.log('Payment intent created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Payment service error:', error);
      
      // Check if it's an auth issue and handle appropriately
      if (error.response?.data?.error === 'jwt malformed') {
        console.error('Authentication token is malformed. User might need to login again.');
        // Handle re-authentication logic here if needed
      }
      
      throw error;
    }
  },
  getTerms: async () => {
    const response = await api.get('/terms');
    return response.data;
  },
  addTerm: async (termData: any) => {
    const response = await api.post('/terms', termData);
    return response.data;
  },
  editTerm: async (termData: any) => {
    const response = await api.put('/terms', termData);
    return response.data;
  },
  confirmTerm: async (termId: string) => {
    const response = await api.post(`/terms/confirm/${termId}`);
    return response.data;
  },

};






      
