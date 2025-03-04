const express = require("express");
const router = express.Router();
const {
  Login,
  Register,
  uploadProfilePicture,
  getUserById,
  updateContentCreatorProfile, // Import the new method
} = require("../controller/userController");
const upload = require('../config/multer'); // Import Multer configuration

const { GoogleAuth } = require("../controller/googleAuthController");

// Existing routes
router.post('/login', Login);
router.post('/register', Register);
router.post('/google-auth', GoogleAuth);
router.post('/upload-profile-picture', upload.single('profilePicture'), uploadProfilePicture);

// New route to fetch user data by ID
router.get('/users/:userId', getUserById);

// New route to update content creator profile
router.put('/content-creator/:userId', updateContentCreatorProfile);

module.exports = router;