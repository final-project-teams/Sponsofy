const { sequelize } = require('../database/connection');
const { models } = sequelize;




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
    
    // Find the company in the database
    const company = await models.Company.findByPk(id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Update the company in the database
    await company.update(companyData);
    
    // Return the updated company
    res.status(200).json({ 
      message: 'Company updated successfully',
      success: true,
      company
    });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Failed to update company', error: error.message });
  }
};

// Get company by User ID
const getCompanyByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching company for user ID:', userId);
    
    const company = await models.Company.findOne({
      where: { UserId: userId }
    });
    
    if (!company) {
      return res.status(404).json({ message: 'No company found for this user' });
    }
    
    res.status(200).json(company);
  } catch (error) {
    console.error('Error fetching company by user ID:', error);
    res.status(500).json({ message: 'Failed to fetch company', error: error.message });
  }
};

module.exports = {
  getCompanyById,
  createCompany,
  updateCompany,
  getCompanyByUserId
}; 