const { Contract } = require("../database/connection");

module.exports = {
  addDeal: async (req, res) => {
    try {
      const { title, description, budget, start_date, end_date, terms, rank } =
        req.body;

      // Convert string dates to Date objects
      const parsedStartDate = new Date(start_date);
      const parsedEndDate = new Date(end_date);

      // Validate dates
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      const contract = await Contract.create({
        title,
        description,
        budget,
        rank,
        start_date: parsedStartDate,
        end_date: parsedEndDate,
        payment_terms: terms, // Map 'terms' to 'payment_terms'
      });

      res.status(201).json(contract);
    } catch (error) {
      console.error("Error creating contract:", error);
      res.status(500).json({ error: error.message });
    }
  },
};
