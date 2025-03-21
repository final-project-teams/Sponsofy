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
  updateProfile,
  associateSubCriteria,
  getSubCriteriaByCriteriaId,
  getAllCriteria,
  associatePlatformWithCriteria,
  getContentCreatorMedia,
  uploadMedia,
  deleteMedia,
} = require("../controller/userController");
const { upload } = require("../middleware/uploadMiddleware");
const { GoogleAuth } = require("../controller/googleAuthController");
const authenticateJWT = require("../auth/refreshToken");
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');

// New routes for criteria selection flow
router.get("/all-criteria", getAllCriteria);
// Updated route to use criteriaId as a param
router.post(
  "/associate-platform-criteria/:criteriaId",
  authenticateJWT,
  associatePlatformWithCriteria
);
router.get("/sub-criteria", getSubCriteriaByCriteriaId);
router.post("/associate-subcriteria", authenticateJWT, associateSubCriteria);

// Existing routes
router.put("/:userId/social-media", updateSocialMedia);
router.get("/:userId/social-media", getSocialMediaStats);
router.post("/login", Login);
router.post("/register", uploadSingle, handleUploadError, Register);
router.post("/google-auth", GoogleAuth);
router.get("/me", authenticateJWT, getCurrentUser);
router.get("/users/:userId", getUserById);
router.put(
  "/content-creator/:userId",
  upload.single("media"),
  updateContentCreatorProfile
);
router.put("/profile", authenticateJWT, upload.single("media"), updateProfile);

// Get all media for a content creator
router.get(
  "/content-creator/:contentCreatorId/media",
  authenticateJWT,
  getContentCreatorMedia
);
// Upload new media
router.post("/media", authenticateJWT, upload.single("media"), uploadMedia);
// Delete media
router.delete("/media/:mediaId", authenticateJWT, deleteMedia);

module.exports = router;
