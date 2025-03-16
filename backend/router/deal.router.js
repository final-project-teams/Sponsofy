// routes/dealRoutes.js (create this file or add to existing file)

const express = require("express");
const router = express.Router();
const { addDeal, getDealById, getDealsByContentCreator } = require("../controller/addDeal");
const authenticateJWT = require("../auth/refreshToken");
const { isContentCreator, isCompany } = require("../middleware/roleMiddleware");
const dealController = require("../controller/dealController");
// Original routes
router.post("/", authenticateJWT, isContentCreator, addDeal);
router.get("/:dealId", authenticateJWT, getDealById);

// New real-time deal routes
router.post('/request', authenticateJWT, isContentCreator, dealController.createDealRequest);
router.post('/accept', authenticateJWT, isCompany, dealController.acceptDeal);
router.post('/reject', authenticateJWT, isCompany, dealController.rejectDeal);
router.get('/creator/deals', authenticateJWT, isContentCreator, dealController.getContentCreatorDeals);
router.get('/company/deals', authenticateJWT, isCompany, dealController.getCompanyDeals);
router.get('/details/:dealId', authenticateJWT, dealController.getDealById);

// Add new route
router.get("/", authenticateJWT, isContentCreator, getDealsByContentCreator);

module.exports = router;
