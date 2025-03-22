// Updated routes file

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
  postMediaLink,
  deleteMediaLink,
} = require("../controller/userController");
const { upload } = require("../middleware/uploadMiddleware");
const { GoogleAuth } = require("../controller/googleAuthController");
const authenticateJWT = require("../auth/refreshToken");

// New routes for criteria selection flow
router.get("/all-criteria", getAllCriteria);
router.post(
  "/associate-platform-criteria/:criteriaId",
  authenticateJWT,
  associatePlatformWithCriteria
);
router.get("/sub-criteria", getSubCriteriaByCriteriaId);
router.post("/associate-subcriteria", authenticateJWT, associateSubCriteria);






// Social media routes - FIXED
router.put("/:userId/social-media", updateSocialMedia);
router.get("/:userId/social-media", getSocialMediaStats);
router.post("/:userId/social-media", postMediaLink); // Add media link
router.delete("/:userId/social-media/:mediaId", deleteMediaLink); // Delete media link




// Authentication routes
router.post("/login", Login);
router.post("/register", upload.single("media"), Register);
router.post("/google-auth", GoogleAuth);
router.get("/me", authenticateJWT, getCurrentUser);
router.get("/users/:userId", getUserById);
router.put(
  "/content-creator/:userId",
  upload.single("media"),
  updateContentCreatorProfile
);
router.put("/profile", authenticateJWT, upload.single("media"), updateProfile);

// Media routes
router.get(
  "/content-creator/:contentCreatorId/media",
  authenticateJWT,
  getContentCreatorMedia
);
router.post("/media", authenticateJWT, upload.single("media"), uploadMedia);
router.delete("/media/:mediaId", authenticateJWT, deleteMedia);

console.log("Routes updated successfully");
console.log("Social media routes are now properly configured");

module.exports = router;