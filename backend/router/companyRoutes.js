const express = require('express');
const router = express.Router();
const companyController = require('../controller/companyController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', companyController.getAllCompanies);
router.get('/oneCompany/:id', companyController.getCompanyProfile);

// Protected routes (require authentication)
router.post('/', authMiddleware, companyController.createCompany);
router.put('/:id', authMiddleware, companyController.updateCompany);

module.exports = router; 