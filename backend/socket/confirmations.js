
function confirmTerm(io, termId) {
  const term = terms.find((t) => t.id === termId);
  if (term) {
    term.status = "confirmed";
    io.emit("termConfirmed", term);
    io.emit("notification", { message: `Term confirmed: ${term.text}` });
    return { success: true, term };
  }
  return { success: false, message: "Term not found" };
}

module.exports = { confirmTerm, terms };
