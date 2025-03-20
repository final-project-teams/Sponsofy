const express = require('express');
const router = express.Router();
const {
  getCompanyById,
  createCompany,
  updateCompany,
  getCompanyByUserId,
  uploadCompanyMedia,
  getCompanyMedia
} = require('../controller/companyController');
const authenticateJWT = require('../auth/refreshToken');
const { isCompany } = require('../middleware/roleMiddleware');
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Company service is running' });
});

// Get all companies


// Get company by ID
router.get('/:id', getCompanyById);

// Get company by User ID
router.get('/user/:userId', getCompanyByUserId);

// Create a new company
router.post('/', createCompany);

// Update a company - requires authentication only
router.put('/:id', authenticateJWT, updateCompany);

// Media routes
// Upload media to company - requires authentication
router.post('/:companyId/media', authenticateJWT, uploadSingle, handleUploadError, uploadCompanyMedia);

// Get all media for a company - public access
router.get('/:companyId/media', getCompanyMedia);

module.exports = router; 