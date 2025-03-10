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
  getContractByContentCreatorId
} = require("../controller/contract.controller");
const authenticateJWT = require("../auth/refreshToken");
const {isCompany} = require("../middleware/roleMiddleware");

// More specific routes first
router.get("/company/:userId", getContractByCompanyId);
router.get("/:id", getContractById);
router.get("/", getContracts);
router.post("/post", createContract);
router.post("/", authenticateJWT, isCompany, addContract);

// New routes for terms
router.get("/:contractId/with-terms", getContractWithTerms);
router.put("/:contractId/terms/:termId", authenticateJWT, updateTermStatus);
router.post("/:contractId/terms", authenticateJWT, addTermsToContract);
router.get("/:contractId/terms", gettermsbycontractid);
router.put("/:contractId/terms/:termId", authenticateJWT, updateTerm);
router.put("/:contractId/terms/:termId/accept", authenticateJWT, acceptTerm);
router.get("/creator/:userId", getContractByContentCreatorId);
module.exports = router;