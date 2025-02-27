const express = require("express");
const router = express.Router();
const { addDeal } = require("../controller/addDeal");

router.post("/", addDeal);

module.exports = router;
