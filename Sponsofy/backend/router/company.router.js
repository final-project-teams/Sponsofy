const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
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

// Public routes
// Get all companies - public access
router.get('/', getAllCompanies);

// Protected routes - require authentication
// Get company by ID - requires authentication
router.get('/:id', authenticateJWT, getCompanyById);

// Get company by User ID - requires authentication
router.get('/user/:userId', authenticateJWT, getCompanyByUserId);

// Create a new company - requires authentication
router.post('/', authenticateJWT, createCompany);

// Update a company - requires authentication and company role
router.put('/:id', authenticateJWT, isCompany, updateCompany);

module.exports = router; 