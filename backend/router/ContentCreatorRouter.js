const { createContentCreator, getContentCreator, getContentCreatorById, updateContentCreator, deleteContentCreator } = require("../controller/ContentCreator");
const router = require("express").Router();

router.post("/", createContentCreator);
router.get("/", getContentCreator);
router.get("/:id", getContentCreatorById);
router.put("/:id", updateContentCreator);
router.delete("/:id", deleteContentCreator);


module.exports = router;