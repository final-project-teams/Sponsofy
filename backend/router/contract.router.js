const router = require("express").Router();
const {
  addContract,
  getContracts,
  createContract,
  getContractById,
  getContractByCompanyId,
  getContractWithTerms,
  updateTermStatus,
  addTermsToContract,
  gettermsbycontractid,
  updateTerm,
  acceptTerm,
  getContractByContentCreatorId,
  updateContractStatus, 
  getContractsForCurrentCompany,
  getContractsByCompanyId,
  getDealsByContractId,
  getContentCreatorContractsByStatus,
} = require("../controller/contract.controller");
const authenticateJWT = require("../auth/refreshToken");
const {isCompany, isContentCreator} = require("../middleware/roleMiddleware");

// More specific routes first
router.get("/company/:userId", authenticateJWT, isCompany, getContractByCompanyId);
router.get("/creator/:userId", authenticateJWT, isContentCreator, getContractByContentCreatorId);
router.get("/:id", getContractById);
router.get("/", getContracts);
router.post("/post", createContract);
router.post("/", authenticateJWT, isCompany, addContract);

// New routes for terms
router.get("/:contractId/with-terms", getContractWithTerms);
router.put("/:contractId/terms/:termId", authenticateJWT, updateTermStatus);
router.post("/:contractId/terms", authenticateJWT, addTermsToContract);
router.get("/:contractId/terms", gettermsbycontractid);
router.put("/:contractId/terms/:termId/update", authenticateJWT, updateTerm);
router.put("/:contractId/terms/:termId/accept", authenticateJWT, acceptTerm);
router.put("/:contractId/update-status", authenticateJWT, updateContractStatus);
router.get("/detail/:contractId", authenticateJWT, getContractById);

router.get("/current", authenticateJWT, isCompany, getContractsForCurrentCompany)
router.get("/company/:id", authenticateJWT, getContractsByCompanyId)
addContract
// Deal routes
router.get("/:contractId/deals", authenticateJWT, getDealsByContractId)

// Content Creator routes - Add these new routes
router.get("/content-creator/:contentCreatorId/status/:status", authenticateJWT, getContentCreatorContractsByStatus)



module.exports = router;