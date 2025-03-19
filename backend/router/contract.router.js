const router = require("express").Router();
const { addContract, getContractsForCurrentCompany, getContractsByCompanyId, getDealsByContractId, getContractById } = require("../controller/contract.controller");
const authenticateJWT = require("../auth/refreshToken");
const { isCompany } = require("../middleware/roleMiddleware");

router.post("/", authenticateJWT, isCompany, addContract);
router.get("/current", authenticateJWT, isCompany, getContractsForCurrentCompany);
router.get("/company/:id", authenticateJWT, getContractsByCompanyId);

// Add this new route for getting contract details
router.get("/detail/:contractId", authenticateJWT, getContractById);

// Add this new route
router.get("/:contractId", authenticateJWT, getDealsByContractId);

module.exports = router;