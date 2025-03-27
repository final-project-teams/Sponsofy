const router = require("express").Router();
const { verifyContract } = require("../controller/QRCodeVerifierController");

router.get("/verify/:serialNumber", verifyContract);

module.exports = router;
