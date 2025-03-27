const router = require("express").Router();
const { verifyContract, processQRCode } = require("../controller/QRCodeVerifierController");

router.get("/verify/:serialNumber", verifyContract);
router.post("/process-image", processQRCode);

module.exports = router;
