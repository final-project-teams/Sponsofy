const { Deal, Term, Contract, Criteria } = require("../database/connection");

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
        termsList,
        criteria  // { name: string, description: string }
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
        company_id: user_id
      });

      // Create the deal associated with the contract
      const deal = await Deal.create({
        content_creator_id: 1,
        company_id: user_id || 1,
        deal_terms: payement_terms,
        price: budget,
        status: 'pending',
        ContractId: contract.id
      });

      // Create terms if provided
      if (termsList && termsList.length > 0) {
        const termsPromises = termsList.map(term => {
          return Term.create({
            title: term.title,
            description: term.description || '',
            status: 'negotiating',
            DealId: deal.id
          });
        });
        
        await Promise.all(termsPromises);
      }

      // Create criteria and associate it with the contract
      if (criteria) {
        await Criteria.create({
          name: criteria.name,
          description: criteria.description,
          ContractId: contract.id
        });
      }

      // Return the created deal with its terms and criteria
      const dealWithTerms = await Deal.findOne({
        where: { id: deal.id },
        include: [
          { model: Term },
          { 
            model: Contract,
            include: [{ model: Criteria }]
          }
        ]
      });

      res.status(201).json(dealWithTerms);
    } catch (error) {
      console.error("Error creating deal:", error);
      res.status(500).json({ error: error.message });
    }
  },
};
