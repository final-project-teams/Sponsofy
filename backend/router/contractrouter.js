const express = require('express');
const router = express.Router();
const contractController = require('../controller/ContractController');
const authMiddleware = require('../auth/refreshToken');
// Fetch contracts for a specific user
router.get('/', contractController.getContracts);

// Create a new contract
router.post('/', contractController.createContract);

// Accept a contract
router.post('/:contractId/accept',authMiddleware, contractController.acceptContract);

// Get contracts by companyId
router.get('/company/:companyId', contractController.getContractbyCompanyId);

// Get contracts by ContentCreatorId
router.get('/contentCreator/:ContentCreatorId', contractController.getContractbyContentCreatorId);

// Get contracts by DealId
router.get('/deal/:DealId', contractController.getContractbyDealId);

module.exports = router;