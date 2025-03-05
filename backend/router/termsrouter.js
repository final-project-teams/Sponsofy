const express = require("express");
const { addTerm, confirmTerm } = require("../controller/terms");

function createTermsRouter(io) {
  const router = express.Router();

  router.post("/add-term", (req, res) => addTerm(io, req, res));
  router.post("/confirm-term", (req, res) => confirmTerm(io, req, res));

  return router;
}

module.exports = createTermsRouter;
