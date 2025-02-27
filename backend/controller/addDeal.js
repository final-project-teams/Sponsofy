const Contract = require("../database/models/contract");

module.exports = {
    addDeal: async (req, res) => {
        try {
            const { title, description, budget, start_date, end_date, payment_terms } = req.body;
            const contract = await Contract.create({ title, description, budget, start_date, end_date, payment_terms });
            res.status(201).json(contract);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}