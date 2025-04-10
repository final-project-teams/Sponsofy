const express = require("express");
const router = express.Router();
const { Post } = require("../database/models/post");

router.post("/", async (req, res) => {
  try {
    const { title, body, platform, status, content_creator_id } = req.body;
    const post = await Post.create({ title, body, platform, status, content_creator_id });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Failed to create post", error: error.message });
  }
});

module.exports = router;