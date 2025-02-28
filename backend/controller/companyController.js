const { Company, User } = require('../database/connection');

const companyController = {
  // Create a company profile
  async createCompany(req, res) {
    try {
      const { name, industry, location, description, codeFiscal } = req.body;
      const userId = req.user?.id; // Get userId from authenticated user

      console.log('Creating company with data:', { name, industry, location, codeFiscal, userId });

      // Validate required fields
      if (!name || !industry || !location || !codeFiscal) {
        return res.status(400).json({ 
          error: 'Missing required fields: name, industry, location, and codeFiscal are required' 
        });
      }

      // Check if company with codeFiscal already exists
      const existingCompany = await Company.findOne({ where: { codeFiscal } });
      if (existingCompany) {
        return res.status(400).json({ 
          error: 'A company with this fiscal code already exists' 
        });
      }

      const company = await Company.create({
        name,
        industry,
        location,
        description,
        codeFiscal,
        UserId: userId
      });

      console.log('Company created successfully:', company.id);
      return res.status(201).json(company);
    } catch (error) {
      console.error('Error creating company:', error);
      return res.status(500).json({ 
        error: 'Failed to create company profile',
        details: error.message 
      });
    }
  },

  // Get all companies
  async getAllCompanies(req, res) {
    try {
      console.log('Fetching all companies...');
      const companies = await Company.findAll({
        include: [{ 
          model: User, 
          as: 'user',
          attributes: ['username', 'email'],
          required: false // Make this a LEFT JOIN to include companies without users
        }]
      });
      
      console.log(`Found ${companies.length} companies`);
      return res.status(200).json(companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch companies',
        details: error.message 
      });
    }
  },

  // Get company profile
  async getCompanyProfile(req, res) {
    try {
      const { id } = req.params;
      console.log(`Fetching company with ID: ${id}`);
      
      const company = await Company.findByPk(id, {
        include: [{ 
          model: User,
          as: 'user',
          attributes: ['username', 'email'],
          required: false
        }]
      });
      
      if (!company) {
        console.log(`Company with ID ${id} not found`);
        return res.status(404).json({ error: 'Company profile not found' });
      }
      
      return res.status(200).json(company);
    } catch (error) {
      console.error(`Error fetching company ${req.params.id}:`, error);
      return res.status(500).json({ 
        error: 'Failed to fetch company profile',
        details: error.message
      });
    }
  },

  // Update company profile
  async updateCompany(req, res) {
    try {
      const { id } = req.params;
      const { name, industry, location, description, codeFiscal } = req.body;

      console.log(`Updating company with ID: ${id}`);
      
      const company = await Company.findByPk(id);
      
      if (!company) {
        return res.status(404).json({ error: 'Company profile not found' });
      }

      await company.update({
        name,
        industry,
        location,
        description,
        codeFiscal
      });

      console.log(`Company ${id} updated successfully`);
      return res.status(200).json(company);
    } catch (error) {
      console.error(`Error updating company ${req.params.id}:`, error);
      return res.status(500).json({ 
        error: 'Failed to update company profile',
        details: error.message
      });
    }
  },

  // Delete company
  async deleteCompany(req, res) {
    try {
      const { id } = req.params;
      console.log(`Deleting company with ID: ${id}`);
      
      const company = await Company.findByPk(id);
      
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      await company.destroy();
      console.log(`Company ${id} deleted successfully`);
      return res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
      console.error(`Error deleting company ${req.params.id}:`, error);
      return res.status(500).json({ 
        error: 'Failed to delete company',
        details: error.message
      });
    }
  }
};

module.exports = companyController; 