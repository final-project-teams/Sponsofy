const express = require("express");
const router = express.Router();
const path = require("path");

const {
  Login,
  Register,
  getUserById,
  updateContentCreatorProfile,
  getCurrentUser,
  updateSocialMedia,
  getSocialMediaStats,
  updateProfile
} = require("../controller/userController");
const { uploadSingle, handleUploadError } = require("../middleware/uploadMiddleware"); // Import the new middleware

const { GoogleAuth } = require("../controller/googleAuthController");
const authenticateJWT = require("../auth/refreshToken");

// Social media routes
router.put('/:userId/social-media', updateSocialMedia);
router.get('/:userId/social-media', getSocialMediaStats);

// Static files
// router.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Existing routes
router.post("/login", Login);
router.post("/register", uploadSingle, handleUploadError, Register);
router.post("/google-auth", GoogleAuth);
router.get("/me", authenticateJWT, getCurrentUser);
router.get("/users/:userId", getUserById);
router.put("/content-creator/:userId", uploadSingle, handleUploadError, updateContentCreatorProfile);

// New route for updating profiles
router.put("/profile", authenticateJWT, uploadSingle, handleUploadError, updateProfile);

module.exports = router;