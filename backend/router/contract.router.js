const router = require("express").Router();
const { addContract, getContractsForCurrentCompany, getContractsByCompanyId, getDealsByContractId } = require("../controller/contract.controller");
const authenticateJWT = require("../auth/refreshToken");
const { isCompany } = require("../middleware/roleMiddleware");

router.post("/", authenticateJWT, isCompany, addContract);
router.get("/current", authenticateJWT, isCompany, getContractsForCurrentCompany);
router.get("/company/:id", authenticateJWT, getContractsByCompanyId);

// Add this new route
router.get("/:contractId/deals", authenticateJWT, getDealsByContractId);

module.exports = router;