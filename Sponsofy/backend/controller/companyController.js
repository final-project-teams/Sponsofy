const { Company, User } = require('../database/connection');

// Get all companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll();
    res.status(200).json(companies);
  } catch (error) {
    console.error('Error fetching all companies:', error);
    res.status(500).json({ message: 'Error fetching companies', error: error.message });
  }
};

// Get company by ID
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
    
    const company = await Company.findByPk(id);
    
    if (!company) {
      return res.status(404).json({ message: `Company with ID ${id} not found` });
    }
    
    res.status(200).json(company);
  } catch (error) {
    console.error(`Error fetching company by ID:`, error);
    res.status(500).json({ message: 'Error fetching company', error: error.message });
  }
};

// Get company by User ID
const getCompanyByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    console.log(`Looking for company with userId: ${userId}`);
    
    // Find company where userId matches
    const company = await Company.findOne({
      where: { userId: userId }
    });
    
    if (!company) {
      return res.status(404).json({ message: `No company found for user ID ${userId}` });
    }
    
    res.status(200).json(company);
  } catch (error) {
    console.error(`Error fetching company by user ID:`, error);
    res.status(500).json({ message: 'Error fetching company by user ID', error: error.message });
  }
};

// Create a new company
const createCompany = async (req, res) => {
  try {
    const companyData = req.body;
    
    // Check if user exists if userId is provided
    if (companyData.userId) {
      const user = await User.findByPk(companyData.userId);
      if (!user) {
        return res.status(404).json({ message: `User with ID ${companyData.userId} not found` });
      }
    }
    
    const newCompany = await Company.create(companyData);
    
    // If this company is created with a userId, update the user's role to 'company'
    if (companyData.userId) {
      await User.update(
        { role: 'company' },
        { where: { id: companyData.userId } }
      );
    }
    
    res.status(201).json(newCompany);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: 'Error creating company', error: error.message });
  }
};

// Update a company
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const companyData = req.body;
    
    if (!id) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
    
    // Check if company exists
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ message: `Company with ID ${id} not found` });
    }
    
    // Check if user is authorized to update this company
    if (req.user && req.user.role !== 'admin') {
      // If not admin, check if user owns this company
      if (company.userId !== req.user.id) {
        return res.status(403).json({ message: 'You are not authorized to update this company' });
      }
    }
    
    // Update the company
    await company.update(companyData);
    
    // Get the updated company
    const updatedCompany = await Company.findByPk(id);
    
    res.status(200).json(updatedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Error updating company', error: error.message });
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  getCompanyByUserId
}; 