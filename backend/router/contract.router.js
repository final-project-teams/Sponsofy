const router = require("express").Router()
const {
  addContract,
  getContractsForCurrentCompany,
  getContractsByCompanyId,
  getDealsByContractId,
  getContentCreatorContractsByStatus,
} = require("../controller/contract.controller")
const authenticateJWT = require("../auth/refreshToken")
const { isCompany, isContentCreator } = require("../middleware/roleMiddleware")

// Company routes
router.post("/", authenticateJWT, isCompany, addContract)
router.get("/current", authenticateJWT, isCompany, getContractsForCurrentCompany)
router.get("/company/:id", authenticateJWT, getContractsByCompanyId)

// Deal routes
router.get("/:contractId/deals", authenticateJWT, getDealsByContractId)

// Content Creator routes - Add these new routes
router.get("/content-creator/:contentCreatorId/status/:status", authenticateJWT, getContentCreatorContractsByStatus)

module.exports = router

