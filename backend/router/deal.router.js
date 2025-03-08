const express = require("express");
const router = express.Router();
const { addDeal, getDealById } = require("../controller/addDeal");
const authenticateJWT = require("../auth/refreshToken");
const { isContentCreator } = require("../middleware/roleMiddleware");

router.post("/", authenticateJWT, isContentCreator, addDeal);
router.get("/:dealId", authenticateJWT, getDealById);

module.exports = router;
