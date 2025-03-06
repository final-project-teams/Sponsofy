const express = require('express');
const { createPaymentIntent } = require('../controller/payment'); // Import the controller
const authenticateJWT = require('../auth/refreshToken'); // Adjust the path as necessary
const router = express.Router();


// Apply the authentication middleware to the payment route
router.post('/create-payment-intent', authenticateJWT, createPaymentIntent);

module.exports = router;
