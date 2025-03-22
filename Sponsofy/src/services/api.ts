import api from '../config/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config/source';

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
    const response = await api.get('/contract');
    return response.data;
  },
  
  // Fetch contracts for a specific user
  getContractByCompanyId: async (userId: number ) => {
  try { 
    const response = await api.get(`/contract/company/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }

},  
getContractByContentCreatorId: async (userId: number) => {
  try {
    console.log('Fetching contracts for content creator with ID:', userId);
    // Update to match your backend route
    const response = await api.get(`/contract/creator/${userId}`);
    console.log('Content creator contracts response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching content creator contracts:', error);
    throw error;
  }
},

    // Accept a contract

    // Create a new contract
    createContract: async (contractData) => {
      try {
        const response = await api.post('/contract/post', contractData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update an existing contract
    updateContract: async (contractId, contractData) => {
        try {
            const response = await api.put(`/contract/${contractId}`, contractData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateContractStatus: async (contractId, status) => {
        try {
            const response = await api.put(`/contract/${contractId}/update-status`, { status });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    

    // Delete a contract
    deleteContract: async (contractId) => {
        try {
            const response = await api.delete(`/contract/${contractId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

  // Get contract terms
  getContractTerms: async (contractId: number | string) => {
    try {
      const response = await api.get(`/contract/${contractId}/terms`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contract terms:', error);
      throw error;
    }
  },

  

  // Get contract by ID with terms

  gettermsbycontractid: async (contractId: number | string) => {
    try {
      console.log('Making API request for contract ID:', contractId);
      const response = await api.get(`/contract/${contractId}/terms`);
      console.log('Full API response:', response);
      return response.data;
    } catch (error) {
      console.error('Error in gettermsbycontractid:', error);
      throw error;
    }
  },
updateTerm: async (contractId: number | string, termId: number | string, updates: { title: string, description: string }) => {
  try {
    console.log('Sending update request:', { contractId, termId, updates });
    
    const response = await api.put(`/contract/${contractId}/terms/${termId}/update`, updates);
    
    console.log('Server response:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update term');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error in updateTerm:', error);
    throw error;
  }
},
acceptTerm: async (contractId: number | string, termId: number | string, userRole: 'company' | 'influencer') => {
  try {
    const response = await api.put(`/contract/${contractId}/terms/${termId}/accept`, { userRole });
    return response.data;
  } catch (error) {
    throw error;
  }
},
getContractPaymentDetails: async (contractId: number) => {
  try {
    const response = await api.get(`/contract/${contractId}/payment-details`);
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
  createPaymentIntent: async (paymentData: {
    contractId: number;
    amount: number;
    userId: number;
    currency?: string;
  }) => {
    try {
      const response = await api.post('/payment/create-payment-intent', paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createEscrowPayment: async (paymentData: {
    contractId: number;
    amount: number;
    userId: number;
    currency?: string;
    escrowHoldPeriod?: number;
  }) => {
    try {
      const dataWithHoldPeriod = {
        ...paymentData,
        escrowHoldPeriod: paymentData.escrowHoldPeriod || 7
      };
      
      console.log('Sending payment data:', JSON.stringify(dataWithHoldPeriod));
      const response = await api.post('/payment/create-escrow-payment', dataWithHoldPeriod);

      // Convert paymentId to string before returning
      if (response.data.success && response.data.paymentId) {
        response.data.paymentId = response.data.paymentId.toString();
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Server error response:', error.response.data);
      }
      throw error;
    }
  },
  confirmEscrowPayment: async (paymentId: string) => {
    try {
      // Log the data being sent
      console.log('Sending confirmation request for payment ID:', paymentId);
      
      // Make sure paymentId is sent in the correct format
      const response = await api.post('/payment/confirm-escrow', { 
        paymentId: paymentId.toString() // Ensure it's a string
      });
      
      console.log('Confirmation response:', response.data);
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Server error during confirmation:', error.response.data);
      }
      console.error('Error confirming escrow payment:', error);
      throw error;
    }
  },
  getPaymentStatus: async (contractId: string) => {
    try {
      console.log('Fetching payment status for contract:', contractId);
      const response = await api.get(`/payment/status/${contractId}`);
      
      console.log('Payment status response:', response.data);
      
      if (!response.data || !response.data.status) {
        return {
          status: 'pending',
          message: 'Awaiting payment',
          amount: 1000,
          currency: 'usd'
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      return {
        status: 'pending',
        message: 'Unable to fetch payment status',
        amount: 1000,
        currency: 'usd'
      };
    }
  },
  refundPayment: async (paymentId: string, reason: string) => {
    try {
      const response = await api.post('/payment/refund-payment', { 
        paymentId,
        reason 
      });
      return response.data;
    } catch (error) {
      console.error('Error refunding payment:', error);
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

// Fetch contracts for a specific company
export const getContractbyCompanyId = async (companyId: string) => {
    try {
        const response = await api.get(`/contract/company/${companyId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Accept a contract
export const acceptContract = async (contractId: string, userId: string) => {
    try {
        const response = await api.post(`/contract/${contractId}/accept`, { userId });
        return response.data;
    } catch (error) {
        throw error;
    }
};






      
