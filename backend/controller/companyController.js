const { Company, User } = require('../database/connection');

const companyController = {
  // Create a company profile
  async createCompany(req, res) {
    try {
      const { name, industry, location, description, codeFiscal } = req.body;
      const userId = req.user?.id; // Get userId from authenticated user

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

      res.status(201).json(company);
    } catch (error) {
      console.error('Error creating company:', error);
      res.status(500).json({ 
        error: 'Failed to create company profile',
        details: error.message 
      });
    }
  },

  // Get all companies
  async getAllCompanies(req, res) {
    try {
      const companies = await Company.findAll({
        include: [{ model: User, attributes: ['username', 'email'] }]
      });
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch companies' });
    }
  },

  // Get company profile
  async getCompanyProfile(req, res) {
    try {
      const company = await Company.findByPk(req.params.id, {
        include: [{ 
          model: User,
          attributes: ['username', 'email']
        }]
      });
      
      if (!company) {
        return res.status(404).json({ error: 'Company profile not found' });
      }
      
      res.json(company);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch company profile' });
    }
  },

  // Update company profile
  async updateCompany(req, res) {
    try {
      const { id } = req.params;
      const { name, industry, location, description, codeFiscal } = req.body;

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

      res.json(company);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update company profile' });
    }
  },

  // Delete company
  async deleteCompany(req, res) {
    try {
      const company = await Company.findByPk(req.params.id);
      
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      await company.destroy();
      res.json({ message: 'Company deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete company' });
    }
  }
};

module.exports = companyController; 