const { terms } = require("../database/models/term");

const addTerm = (io, req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Text is required" });

  const term = { id: Date.now(), text, status: "pending" };
  terms.push(term);

  // Notify all users in real-time
  io.emit("newTerm", term);
  io.emit("notification", { message: `New term added: ${term.text}` });

  res.status(201).json(term);
};

const confirmTerm = (io, req, res) => {
  const { id } = req.body;
  const term = terms.find((t) => t.id === id);

  if (!term) return res.status(404).json({ message: "Term not found" });

  term.status = "confirmed";

  // Notify all users in real-time
  io.emit("termConfirmed", term);
  io.emit("notification", { message: `Term confirmed: ${term.text}` });

  res.json({ message: "Term confirmed", term });
};

const editTerm = (io, req, res) => {
  const { id, text } = req.body;
  const term = terms.find((t) => t.id === id);

  if (!term) return res.status(404).json({ message: "Term not found" });

  term.text = text;

  // Notify all users in real-time
  io.emit("notification", { message: `Term updated: ${term.text}` });

  res.json({ message: "Term updated", term });
};

module.exports = { addTerm, confirmTerm, editTerm };
