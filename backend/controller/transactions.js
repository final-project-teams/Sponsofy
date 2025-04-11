const { Transaction, ContentCreator, Deal, Company } = require("../database/connection");
const { Op } = require("sequelize");
const { sequelize } = require("../database/connection");

// Utility function to validate transaction data
const validateTransactionData = (data) => {
  const { amount, status, payment_method, contentCreatorId, dealId, companyId } = data;
  if (!amount || !status || !payment_method || !contentCreatorId || !dealId || !companyId) {
    return false;
  }
  return true;
};

module.exports = {
  // Create a new transaction
  createTransaction: async (req, res) => {
    try {
      const { amount, status, payment_method, contentCreatorId, dealId, companyId } = req.body;

      if (!validateTransactionData(req.body)) {
        return res.status(400).json({ error: true, message: "All fields are required" });
      }

      const transaction = await Transaction.create({
        amount,
        status,
        payment_method,
        contentCreatorId,
        dealId,
        companyId,
      });

      res.status(201).json({ error: false, message: "Transaction created successfully", transaction });
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: true, message: "Failed to create transaction", details: error.message });
    }
  },

  // Get all transactions
  getAllTransactions: async (req, res) => {
    try {
      const transactions = await Transaction.findAll({
        include: [
          { model: ContentCreator, as: 'contentCreator' },
          { model: Deal, as: 'deal' },
          { model: Company, as: 'company' },
        ],
      });
      res.status(200).json({ error: false, message: "Transactions fetched successfully", transactions });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: true, message: "Failed to fetch transactions", details: error.message });
    }
  },

  // Get a single transaction by ID
  getTransactionById: async (req, res) => {
    try {
      const { id } = req.params;
      const transaction = await Transaction.findByPk(id, {
        include: [
          { model: ContentCreator, as: 'contentCreator' },
          { model: Deal, as: 'deal' },
          { model: Company, as: 'company' },
        ],
      });

      if (!transaction) {
        return res.status(404).json({ error: true, message: "Transaction not found" });
      }

      res.status(200).json({ error: false, message: "Transaction fetched successfully", transaction });
    } catch (error) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ error: true, message: "Failed to fetch transaction", details: error.message });
    }
  },

  // Update a transaction
  updateTransaction: async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, status, payment_method, contentCreatorId, dealId, companyId } = req.body;

      const transaction = await Transaction.findByPk(id);

      if (!transaction) {
        return res.status(404).json({ error: true, message: "Transaction not found" });
      }

      await transaction.update({
        amount,
        status,
        payment_method,
        contentCreatorId,
        dealId,
        companyId,
      });

      res.status(200).json({ error: false, message: "Transaction updated successfully", transaction });
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(500).json({ error: true, message: "Failed to update transaction", details: error.message });
    }
  },

  // Delete a transaction
  deleteTransaction: async (req, res) => {
    try {
      const { id } = req.params;
      const transaction = await Transaction.findByPk(id);

      if (!transaction) {
        return res.status(404).json({ error: true, message: "Transaction not found" });
      }

      await transaction.destroy();
      res.status(200).json({ error: false, message: "Transaction deleted successfully" });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ error: true, message: "Failed to delete transaction", details: error.message });
    }
  },

  // Get all transactions for a specific content creator
  getTransactionsByContentCreator: async (req, res) => {
    try {
      const { contentCreatorId } = req.params;
      const transactions = await Transaction.findAll({
        where: { contentCreatorId },
        include: [
          { model: ContentCreator, as: 'contentCreator' },
          { model: Deal, as: 'deal' },
          { model: Company, as: 'company' },
        ],
      });

      res.status(200).json({ error: false, message: "Transactions fetched successfully", transactions });
    } catch (error) {
      console.error("Error fetching transactions by content creator:", error);
      res.status(500).json({ error: true, message: "Failed to fetch transactions", details: error.message });
    }
  },

  // Get all transactions for a specific deal
  getTransactionsByDeal: async (req, res) => {
    try {
      const { dealId } = req.params;
      const transactions = await Transaction.findAll({
        where: { dealId },
        include: [
          { model: ContentCreator, as: 'contentCreator' },
          { model: Deal, as: 'deal' },
          { model: Company, as: 'company' },
        ],
      });

      res.status(200).json({ error: false, message: "Transactions fetched successfully", transactions });
    } catch (error) {
      console.error("Error fetching transactions by deal:", error);
      res.status(500).json({ error: true, message: "Failed to fetch transactions", details: error.message });
    }
  },

  // Get all transactions for a specific company
  getTransactionsByCompany: async (req, res) => {
    try {
      const { companyId } = req.params;
      const transactions = await Transaction.findAll({
        where: { companyId },
        include: [
          { model: ContentCreator, as: 'contentCreator' },
          { model: Deal, as: 'deal' },
          { model: Company, as: 'company' },
        ],
      });

      res.status(200).json({ error: false, message: "Transactions fetched successfully", transactions });
    } catch (error) {
      console.error("Error fetching transactions by company:", error);
      res.status(500).json({ error: true, message: "Failed to fetch transactions", details: error.message });
    }
  },
};