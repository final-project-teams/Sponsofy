// account.router.js
router.post("/", async (req, res) => {
  try {
    const { platform, token, username, content_creator_id } = req.body;
    const account = await Account.create({ platform, token, username, content_creator_id });
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: "Failed to create account", error: error.message });
  }
});

// post.router.js
router.post("/", async (req, res) => {
  try {
    const { title, body, platform, status, content_creator_id, likes, views } = req.body;
    const post = await Post.create({ title, body, platform, status, content_creator_id, likes, views });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Failed to create post", error: error.message });
  }
});