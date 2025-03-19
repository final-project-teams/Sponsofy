const express = require('express');
const router = express.Router();
const signatureController = require('../controller/signatureController');
const upload = require('../config/multer');
const authenticateJWT = require('../auth/refreshToken'); // Assuming this is your auth middleware

// Create signature with image upload
router.post('/', 
    authenticateJWT, 
    upload.single('signature'), // 'signature' is the field name for the image file
    signatureController.createSignature
);

// Get signature by contract ID
router.get('/contract/:contractId',
    authenticateJWT,
    signatureController.getSignatureByContract
);

module.exports = router;
