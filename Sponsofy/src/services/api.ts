import api from '../config/axios';

export const companyService = {
  getCompanies: async () => {
    try {
      const response = await api.get('/api/companies');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCompanyById: async (id: string) => {
    try {
      const response = await api.get(`/api/companies/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createCompany: async (companyData: any) => {
    try {
      const response = await api.post('/api/companies', companyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateCompany: async (id: string, companyData: any) => {
    try {
      const response = await api.put(`/api/companies/${id}`, companyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 