const express = require('express');
const router = express.Router();
const signatureController = require('../controller/signatureController');
const upload = require('../config/multer');
const authenticateJWT = require('../auth/refreshToken');

// Create signature with image upload (requires authentication)
router.post('/', 
    authenticateJWT,
    upload.single('signature'), 
    signatureController.createSignature
);

// Get current user's signatures (requires authentication)
router.get('/user',
    authenticateJWT,
    signatureController.getUserSignatures
);

// Get all signatures
router.get('/',
    signatureController.getAllSignatures
);

// Get signature by ID
router.get('/:id',
    signatureController.getSignatureById
);

// Delete signature
router.delete('/:id',
    signatureController.deleteSignature
);

module.exports = router;
