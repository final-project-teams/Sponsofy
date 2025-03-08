const { sequelize } = require('../database/connection');
const { models } = sequelize;

// Get all companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await models.Company.findAll();
    res.status(200).json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Failed to fetch companies', error: error.message });
  }
};

// Get company by ID
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await models.Company.findByPk(id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.status(200).json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ message: 'Failed to fetch company', error: error.message });
  }
};

// Create a new company
const createCompany = async (req, res) => {
  try {
    const companyData = req.body;
    const newCompany = await models.Company.create(companyData);
    
    res.status(201).json(newCompany);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: 'Failed to create company', error: error.message });
  }
};

// Update a company
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const companyData = req.body;
    
    const company = await models.Company.findByPk(id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    await company.update(companyData);
    
    res.status(200).json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Failed to update company', error: error.message });
  }
};








module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
 
}; 