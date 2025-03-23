const { CardPayment, Company, ContentCreator } = require("../database/connection");

// Utility function to validate card payment data
const validateCardPaymentData = (data) => {
  const { cardNumber, cardHolderName, expirationDate, cvv, amount } = data;
  if (!cardNumber || !cardHolderName || !expirationDate || !cvv || !amount) {
    return false;
  }
  return true;
};

module.exports = {
  // Create a new card payment
  createCardPayment: async (req, res) => {
    try {
      const { cardNumber, cardHolderName, expirationDate, cvv, amount, companyId, contentCreatorId } = req.body;

      if (!validateCardPaymentData(req.body)) {
        return res.status(400).json({ error: true, message: "All fields are required" });
      }

      // Check if either companyId or contentCreatorId is provided
      if (!companyId && !contentCreatorId) {
        return res.status(400).json({ error: true, message: "Either companyId or contentCreatorId is required" });
      }

      const cardPayment = await CardPayment.create({
        cardNumber,
        cardHolderName,
        expirationDate,
        cvv,
        amount,
        companyId,
        contentCreatorId,
      });

      res.status(201).json({ error: false, message: "Card payment created successfully", cardPayment });
    } catch (error) {
      console.error("Error creating card payment:", error);
      res.status(500).json({ error: true, message: "Failed to create card payment", details: error.message });
    }
  },

  // Get all card payments
  getAllCardPayments: async (req, res) => {
    try {
      const cardPayments = await CardPayment.findAll({
        include: [
          { model: Company, as: "company" },
          { model: ContentCreator, as: "contentCreator" },
        ],
      });
      res.status(200).json({ error: false, message: "Card payments fetched successfully", cardPayments });
    } catch (error) {
      console.error("Error fetching card payments:", error);
      res.status(500).json({ error: true, message: "Failed to fetch card payments", details: error.message });
    }
  },

  // Get card payments by company ID
  getCardPaymentsByCompanyId: async (req, res) => {
    try {
      const { companyId } = req.params;
      const cardPayments = await CardPayment.findAll({
        where: { companyId },
        include: [{ model: Company, as: "company" }],
      });
      res.status(200).json({ error: false, message: "Card payments fetched successfully", cardPayments });
    } catch (error) {
      console.error("Error fetching card payments by company ID:", error);
      res.status(500).json({ error: true, message: "Failed to fetch card payments", details: error.message });
    }
  },

  // Get card payments by content creator ID
  getCardPaymentsByContentCreatorId: async (req, res) => {
    try {
      const { contentCreatorId } = req.params;
      const cardPayments = await CardPayment.findAll({
        where: { contentCreatorId },
        include: [{ model: ContentCreator, as: "contentCreator" }],
      });
      res.status(200).json({ error: false, message: "Card payments fetched successfully", cardPayments });
    } catch (error) {
      console.error("Error fetching card payments by content creator ID:", error);
      res.status(500).json({ error: true, message: "Failed to fetch card payments", details: error.message });
    }
  },

  // Get a single card payment by ID
  getCardPaymentById: async (req, res) => {
    try {
      const { id } = req.params;
      const cardPayment = await CardPayment.findByPk(id, {
        include: [
          { model: Company, as: "company" },
          { model: ContentCreator, as: "contentCreator" },
        ],
      });

      if (!cardPayment) {
        return res.status(404).json({ error: true, message: "Card payment not found" });
      }

      res.status(200).json({ error: false, message: "Card payment fetched successfully", cardPayment });
    } catch (error) {
      console.error("Error fetching card payment:", error);
      res.status(500).json({ error: true, message: "Failed to fetch card payment", details: error.message });
    }
  },

  // Update a card payment
  updateCardPayment: async (req, res) => {
    try {
      const { id } = req.params;
      const { cardNumber, cardHolderName, expirationDate, cvv, amount, companyId, contentCreatorId } = req.body;

      const cardPayment = await CardPayment.findByPk(id);

      if (!cardPayment) {
        return res.status(404).json({ error: true, message: "Card payment not found" });
      }

      await cardPayment.update({
        cardNumber,
        cardHolderName,
        expirationDate,
        cvv,
        amount,
        companyId,
        contentCreatorId,
      });

      res.status(200).json({ error: false, message: "Card payment updated successfully", cardPayment });
    } catch (error) {
      console.error("Error updating card payment:", error);
      res.status(500).json({ error: true, message: "Failed to update card payment", details: error.message });
    }
  },

  // Delete a card payment
  deleteCardPayment: async (req, res) => {
    try {
      const { id } = req.params;
      const cardPayment = await CardPayment.findByPk(id);

      if (!cardPayment) {
        return res.status(404).json({ error: true, message: "Card payment not found" });
      }

      await cardPayment.destroy();
      res.status(200).json({ error: false, message: "Card payment deleted successfully" });
    } catch (error) {
      console.error("Error deleting card payment:", error);
      res.status(500).json({ error: true, message: "Failed to delete card payment", details: error.message });
    }
  },
};