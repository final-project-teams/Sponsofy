const express = require('express');
const router = express.Router();
const {

  getCompanyById,
  createCompany,
  updateCompany,
  getCompanyByUserId
} = require('../controller/companyController');
const authenticateJWT = require('../auth/refreshToken');
const { isCompany } = require('../middleware/roleMiddleware');

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

module.exports = router; 