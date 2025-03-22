const express = require('express');
const {  createPaymentIntent,createEscrowPayment ,refundPayment,getPaymentStatus,confirmEscrowPayment} = require('../controller/payment'); // Import the controller
const authenticateJWT = require('../auth/refreshToken'); // Adjust the path as necessary
const { isCompany, isContentCreator } = require('../middleware/roleMiddleware');
const router = express.Router();


// Apply the authentication middleware to the payment route
        router.post('/create-escrow-payment', authenticateJWT,isCompany, createEscrowPayment);
        router.post('/refund-payment', authenticateJWT, refundPayment);
        router.get('/payment-status/:id', authenticateJWT, getPaymentStatus);
        router.post('/confirm-escrow',  authenticateJWT,isCompany,confirmEscrowPayment);
        router.post('/create-payment-intent', authenticateJWT, isCompany, createPaymentIntent);

module.exports = router;
