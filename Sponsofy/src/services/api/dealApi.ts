import api from '../../config/axios';

export interface Media {
  id: number;
  url: string;
  type: string;
  createdAt: string;
}

export interface Term {
  id: number;
  content: string;
  status: string;
  media?: Media[];
  posts?: any[];
}

export interface ContentCreator {
  id: number;
  first_name: string;
  last_name: string;
  bio: string;
  ProfilePicture?: Media;
  accounts?: any[];
}

export interface Deal {
  id: number;
  deal_terms: string;
  price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
  Terms: Term[];
  ContentCreatorDeals: ContentCreator;
  AttachedMedia: Media[];
}

const dealApi = {
  getDealsByContractId: async (contractId: string): Promise<Deal[]> => {
    try {
      const response = await api.get(`/api/contract/${contractId}/deals`);
      return response.data.deals;
    } catch (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }
  }
};

export default dealApi;
