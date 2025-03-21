const router = require("express").Router();
const { addContract, getContractsForCurrentCompany, getContractsByCompanyId, getDealsByContractId, getContractById, getContractWithDeals } = require("../controller/contract.controller");
const authenticateJWT = require("../auth/refreshToken");
const { isCompany } = require("../middleware/roleMiddleware");

router.post("/", authenticateJWT, isCompany, addContract);
router.get("/current", authenticateJWT, isCompany, getContractsForCurrentCompany);
router.get("/company/:id", authenticateJWT, getContractsByCompanyId);

// Route to get a contract with its deals in a single request
router.get("/:id/with-deals", authenticateJWT, getContractWithDeals);

// Route to get a single contract by ID
router.get("/:id", authenticateJWT, getContractById);

// Route to get deals for a contract
router.get("/:contractId/deals", authenticateJWT, getDealsByContractId);

module.exports = router;