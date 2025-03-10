const express = require("express");
const router = express.Router();
const { addDeal, getDealById } = require("../controller/addDeal");
const dealController = require('../controller/dealController');
const authenticateJWT = require("../auth/refreshToken");
const { isContentCreator, isCompany } = require("../middleware/roleMiddleware");

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

module.exports = router;
