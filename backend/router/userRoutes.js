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
const { upload } = require("../middleware/uploadMiddleware"); // Import Multer configuration

const { GoogleAuth } = require("../controller/googleAuthController");
const authenticateJWT = require("../auth/refreshToken");

// Social media routes
router.put('/:userId/social-media', updateSocialMedia);
router.get('/:userId/social-media', getSocialMediaStats);

// Static files
// router.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Existing routes
router.post("/login", Login);
router.post("/register", upload.single("media"), Register);
router.post("/google-auth", GoogleAuth);
router.get("/me", authenticateJWT, getCurrentUser);
router.get("/users/:userId", getUserById);
router.put("/content-creator/:userId", upload.single("media"), updateContentCreatorProfile);

// New route for updating profiles
router.put("/profile",authenticateJWT, upload.single("media"), updateProfile);

module.exports = router;