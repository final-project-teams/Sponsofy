const express = require("express");
const router = express.Router();
const { addDeal, getDealById } = require("../controller/addDeal");
const authenticateJWT = require("../auth/refreshToken");
const { isContentCreator } = require("../middleware/roleMiddleware");
const dealController = require('../controller/dealController');

router.post("/", authenticateJWT, isContentCreator, addDeal);
router.get("/:dealId", authenticateJWT, getDealById);
router.post('/accept', authenticateJWT, dealController.acceptDeal);

module.exports = router;
