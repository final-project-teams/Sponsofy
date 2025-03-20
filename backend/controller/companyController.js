const { sequelize } = require('../database/connection');
const { models } = sequelize;
const { createMediaUrl, getMediaType } = require('../utils/helpers');

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

const uploadCompanyMedia = async (req, res) => {
  try {
    // Get the file from multer middleware
    const file = req.file;
    if (!file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Log authentication information for debugging
    console.log('Auth user in upload media:', req.user);

    // Get companyId from params
    const { companyId } = req.params;
    
    // Verify the company exists
    const company = await models.Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }

    // Verify user has permission (must be company owner or admin)
    // First, check if req.user exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if userId exists in token
    if (!req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user information in token'
      });
    }

    if (req.user.role !== 'admin') {
      // If not admin, check if user owns this company
      const userCompany = await models.Company.findOne({ 
        where: { 
          id: companyId,
          UserId: req.user.userId  // Use userId from token instead of id
        } 
      });
      
      if (!userCompany) {
        return res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to upload media for this company' 
        });
      }
    }

    // Determine media type based on file mimetype
    const mediaType = getMediaType(file.mimetype);

    // Create new media record
    const media = await models.Media.create({
      media_type: mediaType,
      file_url: file.path,
      file_name: file.filename,
      file_size: file.size,
      file_format: file.mimetype,
      description: req.body.description || `Company media: ${file.originalname}`,
      CompanyId: companyId
    });

    // Format response URL
    const formattedMedia = media.toJSON();
    if (formattedMedia.file_url) {
      formattedMedia.file_url = createMediaUrl(formattedMedia.file_url);
    }

    return res.status(200).json({
      success: true,
      message: 'Media uploaded successfully',
      media: formattedMedia
    });
  } catch (error) {
    console.error('Error uploading company media:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload media',
      error: error.message
    });
  }
};

const getCompanyMedia = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Verify the company exists
    const company = await models.Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get all media for the company
    const media = await models.Media.findAll({
      where: { CompanyId: companyId },
      order: [['createdAt', 'DESC']]
    });

    // Format media URLs
    const formattedMedia = media.map(item => {
      const itemJSON = item.toJSON();
      if (itemJSON.file_url) {
        itemJSON.file_url = createMediaUrl(itemJSON.file_url);
      }
      return itemJSON;
    });

    return res.status(200).json({
      success: true,
      media: formattedMedia
    });
  } catch (error) {
    console.error('Error fetching company media:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch company media',
      error: error.message
    });
  }
};

module.exports = {
  getCompanyById,
  createCompany,
  updateCompany,
  getCompanyByUserId,
  uploadCompanyMedia,
  getCompanyMedia
}; 