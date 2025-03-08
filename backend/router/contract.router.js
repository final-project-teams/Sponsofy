const router = require("express").Router();
const { addContract, getContractsForCurrentCompany } = require("../controller/contract.controller");
const authenticateJWT = require("../auth/refreshToken");
const { isCompany } = require("../middleware/roleMiddleware");

router.post("/", authenticateJWT, isCompany, addContract);
router.get("/current", authenticateJWT, isCompany, getContractsForCurrentCompany);

module.exports = router;