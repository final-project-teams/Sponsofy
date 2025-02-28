const express = require('express');
const router = express.Router();
const companyController = require('../controller/companyController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyProfile);

// Protected routes (require authentication)
router.post('/', authMiddleware, companyController.createCompany);
router.put('/:id', authMiddleware, companyController.updateCompany);


// Add a test route
router.get('/test', (req, res) => {
  res.json({ message: 'Company routes are working!' });
});

module.exports = router; 