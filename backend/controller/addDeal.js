const { Deal, Term, Contract } = require("../database/connection");

module.exports = {
  addDeal: async (req, res) => {
    try {
      const { 
        title, 
        description, 
        budget, 
        start_date, 
        end_date, 
        payement_terms, 
        rank,
        user_id,
        termsList 
      } = req.body;

      // Convert string dates to Date objects
      const parsedStartDate = new Date(start_date);
      const parsedEndDate = new Date(end_date);

      // Validate dates
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      // Create the contract first
      const contract = await Contract.create({
        title,
        description,
        budget,
        rank,
        start_date: parsedStartDate,
        end_date: parsedEndDate,
        payment_terms: payement_terms,
        company_id: user_id // Assuming user_id is the company ID
      });

      // Create the deal associated with the contract
      const deal = await Deal.create({
        content_creator_id: 1, // You might want to get this from the request
        company_id: user_id || 1,
        deal_terms: payement_terms,
        price: budget,
        status: 'pending',
        ContractId: contract.id // Associate with the contract
      });

      // Create terms if provided, associated with the deal
      if (termsList && termsList.length > 0) {
        const termsPromises = termsList.map(term => {
          return Term.create({
            title: term.title,
            description: term.description || '',
            status: 'negotiating',
            DealId: deal.id // Associate with the deal, not the contract
          });
        });
        
        await Promise.all(termsPromises);
      }

      // Return the created deal with its terms
      const dealWithTerms = await Deal.findOne({
        where: { id: deal.id },
        include: [{ model: Term }]
      });

      res.status(201).json(dealWithTerms);
    } catch (error) {
      console.error("Error creating deal:", error);
      res.status(500).json({ error: error.message });
    }
  },
};
