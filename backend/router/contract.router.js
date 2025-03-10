const router = require("express").Router();
const {addContract} = require("../controller/contract.controller");
const authenticateJWT = require("../auth/refreshToken");
const {isCompany} = require("../middleware/roleMiddleware");
router.post("/",authenticateJWT,isCompany, addContract);


module.exports = router;