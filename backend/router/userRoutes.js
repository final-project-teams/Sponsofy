const express = require("express");
const router = express.Router();
const { Login, Register} = require("../controller/userController");

const {GoogleAuth} = require("../controller/googleAuthController")

router.post('/login', Login);
router.post('/register', Register);

router.post('/google-auth', GoogleAuth);


module.exports = router;

