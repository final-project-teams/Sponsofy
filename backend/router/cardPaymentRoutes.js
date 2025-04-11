const express = require("express");
const router = express.Router();
const {
  createCardPaymentForCompany,
  createCardPaymentForContentCreator,
  getAllCardPayments,
  getCardPaymentsByCompanyId,
  getCardPaymentsByContentCreatorId,
  getCardPaymentById,
  updateCardPayment,
  deleteCardPayment,
} = require("../controller/cardPaymentController");

// Create a new card payment for a company
router.post("/card-payments/company/:companyId", createCardPaymentForCompany);

// Create a new card payment for a content creator
router.post("/card-payments/content-creator/:contentCreatorId", createCardPaymentForContentCreator);

// Get all card payments
router.get("/card-payments", getAllCardPayments);

// Get card payments by company ID
router.get("/card-payments/company/:companyId", getCardPaymentsByCompanyId);

// Get card payments by content creator ID
router.get("/card-payments/content-creator/:contentCreatorId", getCardPaymentsByContentCreatorId);

// Get a single card payment by ID
router.get("/card-payments/:id", getCardPaymentById);

// Update a card payment by ID
router.put("/card-payments/:id", updateCardPayment);

// Delete a card payment by ID
router.delete("/card-payments/:id", deleteCardPayment);

module.exports = router;