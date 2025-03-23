const express = require("express");
const router = express.Router();
const {getAllCardPayments, createCardPayment,getCardPaymentsByCompanyId ,getCardPaymentsByContentCreatorId} = require("../controller/cardPaymentController");

// Create a new card payment
router.post("/card-payments", createCardPayment);

// Get all card payments
router.get("/card-payments", getAllCardPayments);

// Get card payments by company ID
router.get("/card-payments/company/:companyId", getCardPaymentsByCompanyId);

// Get card payments by content creator ID
router.get("/card-payments/content-creator/:contentCreatorId", getCardPaymentsByContentCreatorId);

module.exports = router;