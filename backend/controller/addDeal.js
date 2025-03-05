const { Deal, Term, Contract, Criteria, SubCriteria } = require("../database/connection");
const jwt = require('jsonwebtoken');

module.exports = {
  addDeal: async (req, res) => {
    try {
      // Get token from header
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'No token provided' 
        });
      }

      // Verify token and get company ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const companyId = decoded.id; // Assuming the token contains the company's ID

      const { 
        title, 
        description, 
        budget, 
        start_date, 
        end_date, 
        payement_terms, 
        rank,
        termsList,
        criteriaList 
      } = req.body;

      // Convert string dates to Date objects
      const parsedStartDate = new Date(start_date);
      const parsedEndDate = new Date(end_date);

      // Validate dates
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      // Create the contract
      const contract = await Contract.create({
        title,
        description,
        amount: budget,
        payment_terms: payement_terms,
        start_date: parsedStartDate,
        end_date: parsedEndDate,
        rank,
        company_id: companyId, // Use the company ID from the token
        status: 'active'
      });

      // Create the deal
      const deal = await Deal.create({
        content_creator_id: 1, // This will be updated when a creator accepts the deal
        company_id: companyId, // Use the company ID from the token
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

      // Create criteria if provided
      if (criteriaList && criteriaList.length > 0) {
        const criteriaPromises = criteriaList.map(criteria => {
          return Criteria.create({
            name: criteria.name,
            description: criteria.description,
            ContractId: contract.id
          });
        });
        await Promise.all(criteriaPromises);
      }

      // Return the created deal with its terms and contract
      const dealWithDetails = await Deal.findOne({
        where: { id: deal.id },
        include: [
          { model: Term },
          { 
            model: Contract,
            include: [{ model: Criteria }]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Deal created successfully',
        deal: dealWithDetails
      });

    } catch (error) {
      console.error("Error creating deal:", error);
      res.status(500).json({ 
        success: false, 
        message: 'Error creating deal',
        error: error.message 
      });
    }
  },
};
