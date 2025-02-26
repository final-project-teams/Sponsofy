const express = require('express');
const router = express.Router();
const companyController = require('../controller/companyController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/companies', companyController.getAllCompanies);
router.get('/companies/:id', companyController.getCompanyProfile);

// Protected routes (require authentication)
router.post('/companies', authMiddleware, companyController.createCompany);
router.put('/companies/:id', authMiddleware, companyController.updateCompany);

module.exports = router; 