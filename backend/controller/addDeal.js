const { Deal, Term, Contract, Company, ContentCreator ,pre_Term} = require("../database/connection");
const jwt = require('jsonwebtoken');

module.exports = {
  addDeal: async (req, res) => {
    try {
      const decoded = req.user;
      const { contractId, termsList, companyId,price } = req.body;

      const contentCreator = await ContentCreator.findOne({ where: { userId: decoded.userId } });

      const contract = await Contract.findOne({ where: { id: contractId, CompanyId: companyId } });

      if (!contract) {
        return res.status(404).json({ 
          success: false, 
          message: 'Contract not found' 
        });
      }

      const deal = await Deal.create({
        contentCreatorId: contentCreator.id,
        deal_terms: contract.payment_terms,
        price: contract.amount,
        status: 'pending',
        ContractId: contract.id,
        price
      });

      if (termsList && termsList.length > 0) {
        await Promise.all(termsList.map(term => {
          return Term.create({
            title: term.title,
            description: term.description || '',
            status: 'negotiating',
            DealId: deal.id
          });
        }));
      }

      res.status(201).json({
        success: true,
        message: 'Deal created successfully',
        deal: {
          id: deal.id,
          status: deal.status
        }
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
  }
};

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
