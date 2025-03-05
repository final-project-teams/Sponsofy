import api from '../config/axios';

export const chatService = {
  getMessages: async (roomId: string) => {
    try {
      const response = await api.get(`chat/rooms/${roomId}/messages`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  sendMessage: async (roomId: string, message: string) => {
    try {
      const response = await api.post(`chat/rooms/${roomId}/messages`, { message });
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
      const response = await api.get(`/user/users/${userId}`);
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






      
