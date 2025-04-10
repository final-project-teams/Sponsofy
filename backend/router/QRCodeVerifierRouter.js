const router = require("express").Router();
const authenticateJWT = require("../auth/refreshToken");
const { verifyContract, processQRCode } = require("../controller/QRCodeVerifierController");

router.get("/verify/:serialNumber", authenticateJWT, verifyContract);
router.post("/process-image", authenticateJWT, processQRCode);

module.exports = router;
