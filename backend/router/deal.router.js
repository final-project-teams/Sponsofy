// routes/dealRoutes.js (create this file or add to existing file)

const express = require("express");
const router = express.Router();
const { addDeal, getDealById, getDealsByContentCreator } = require("../controller/addDeal");
const authenticateJWT = require("../auth/refreshToken");
const { isContentCreator } = require("../middleware/roleMiddleware");

// Keep existing routes
router.post("/", authenticateJWT, isContentCreator, addDeal);
router.get("/:dealId", authenticateJWT, getDealById);

// Add new route
router.get("/", authenticateJWT, isContentCreator, getDealsByContentCreator);

module.exports = router;