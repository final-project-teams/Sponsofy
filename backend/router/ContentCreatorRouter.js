const router = require("express").Router();
const { createContentCreator } = require("../controller/ContentCreatorController");
router.post("/", createContentCreator);
// router.get("/", getContentCreator);
// router.get("/:id", getContentCreatorById);
// router.put("/:id", updateContentCreator);
// router.delete("/:id", deleteContentCreator);


module.exports = router;