const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,

} = require('../controller/companyController');

// Health check route


// Get all companies
router.get('/', getAllCompanies);

// Get company by ID
router.get('/:id', getCompanyById);

// Create a new company
router.post('/', createCompany);

// Update a company
router.put('/:id', updateCompany);



module.exports = router; 