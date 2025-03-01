const { getContract , postContract , updateContract , deleteContract } = require("../controller/ContractController");
const router = require("express").Router();

router.get("/", getContract);
router.post("/", postContract);
router.put("/:id", updateContract);
router.delete("/:id", deleteContract);

module.exports = router;