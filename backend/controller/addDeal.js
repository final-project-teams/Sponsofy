const { Deal, Term, Contract, Company, ContentCreator, pre_Term } = require("../database/connection");
const jwt = require('jsonwebtoken');

module.exports = {
  addDeal: async (req, res) => {
    try {
      const decoded = req.user;
      const { title, description, budget, termsList, start_date, end_date, rank, payement_terms, company_id } = req.body;

      // Create the contract first
      const contract = await Contract.create({
        title,
        description,
        amount: budget,
        payment_terms: payement_terms,
        start_date,
        end_date,
        rank,
        status: 'pending',
        CompanyId: company_id
      });

      // Add terms to pre_terms table
      if (termsList && termsList.length > 0) {
        await Promise.all(termsList.map(term => {
          return pre_Term.create({
            title: term.title,
            description: term.description || '',
            status: 'negotiating',
            ContractId: contract.id
          });
        }));
      }

      // Fetch the created contract with its terms
      const createdContract = await Contract.findOne({
        where: { id: contract.id },
        include: [
          {
            model: Company,
            attributes: ['id', 'name', 'industry', 'codeFiscal', 'category']
          },
          {
            model: pre_Term,
            attributes: ['id', 'title', 'description', 'status']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Contract created successfully',
        contract: createdContract
      });

    } catch (error) {
      console.error("Error creating contract:", error);
      res.status(500).json({ 
        success: false, 
        message: 'Error creating contract',
        error: error.message 
      });
    }
  },

  getDealById: async (req, res) => {
    try {
      const { dealId } = req.params;

      const deal = await Contract.findOne({
        where: { id: dealId },
       
            
            include: [
              {
                model: Company,
                attributes: ['id','name', 'industry', 'codeFiscal','category'] // Ensure these are the correct field names
              }
             
            ],
            attributes: ['id','title', 'description', 'start_date', 'end_date', 'status', 'payment_terms', 'rank']
          }
        );
        
          
      

  

    
            if (deal.id) {
              const terms = await pre_Term.findAll({
                where: { ContractId: deal.id },
                attributes: ['id','title', 'description', 'status']
              });
      
              // Adding terms to the deal object
              deal.dataValues.Terms = terms;
            }
          

      if (!deal) {
        return res.status(404).json({
          success: false,
          message: 'term not found'
        });
      }
      
      res.status(200).json({
        success: true,
       deal
      });

    } catch (error) {
      console.error("Error fetching deal:", error);
      res.status(500).json({
        success: false,
        message: 'Error fetching deal',
        error: error.message
      });
    }
  },
  
  getDealsByContentCreator: async (req, res) => {
    try {
      const decoded = req.user;
      
      // Find the content creator associated with the logged-in user
      const contentCreator = await ContentCreator.findOne({ 
        where: { userId: decoded.userId } 
      });
      
      if (!contentCreator) {
        return res.status(404).json({
          success: false,
          message: 'Content creator profile not found'
        });
      }
      
      // Find all deals associated with this content creator
      const deals = await Deal.findAll({
        where: { contentCreatorId: contentCreator.id },
        include: [
          {
            model: Contract,
            include: [
              {
                model: Company,
              }
            ]
          },
          {
            model: Term
          }
        ],
        order: [['createdAt', 'DESC']] // Most recent deals first
      });

      
      
      res.status(200).json({
        success: true,
        deals
      });
      
    } catch (error) {
      console.error("Error fetching deals:", error);
      res.status(500).json({
        success: false,
        message: 'Error fetching deals',
        error: error.message
      });
    }
  }
}




// Sample request body for creating a deal
/*
{
  "contractId": 1,
  "termsList": [
    {
      "title": "Term 1",
      "description": "Description for term 1"
    },
    {
      "title": "Term 2",
      "description": "Description for term 2"
    }
  ],
  "companyId": 1
}
*/
