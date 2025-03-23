const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionsByContentCreator,
  getTransactionsByDeal,
  getTransactionsByCompany,
} = require('../controller/transactions');

// Create a new transaction
router.post('/', createTransaction);

// Get all transactions
router.get('/', getAllTransactions);

// Get a single transaction by ID
router.get('/:id', getTransactionById);

// Update a transaction
router.put('/:id', updateTransaction);

// Delete a transaction
router.delete('/:id', deleteTransaction);

// Get transactions by content creator
router.get('/content-creator/:contentCreatorId', getTransactionsByContentCreator);

// Get transactions by deal
router.get('/deal/:dealId', getTransactionsByDeal);

// Get transactions by company
router.get('/company/:companyId', getTransactionsByCompany);

module.exports = router;