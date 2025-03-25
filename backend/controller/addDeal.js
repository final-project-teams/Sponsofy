const { Deal, Term, Contract, Company, ContentCreator, pre_Term,Criteria } = require("../database/connection");
const jwt = require('jsonwebtoken');

module.exports = {
  addDeal: async (req, res) => {
    try {
      const decoded = req.user;
      const { contractId, termsList, companyId, price } = req.body;

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

      const createdDeal = await Deal.findOne({
        where: { id: deal.id },
        include: [
          {
            model: Contract,
            include: [
              {
                model: Company,
                attributes: ['id', 'name', 'industry', 'codeFiscal', 'category']
              }
            ],
            attributes: ['id', 'title', 'description', 'start_date', 'end_date', 'status', 'payment_terms', 'rank']
          },
          {
            model: Term,
            attributes: ['id', 'title', 'description', 'status']
          },
          {
            model: ContentCreator,
            attributes: ['id', 'first_name', 'last_name', 'bio', 'pricing', 'portfolio_links', 'location', 'category', 'verified', 'isPremium', 'profile_picture']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Deal created successfully',
        deal: createdDeal
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
            if (deal.id) {
              const criteria = await Criteria.findAll({
                where: { ContractId: deal.id },
                attributes: ['id','name', 'description']
              });
      
              // Adding terms to the deal object
              deal.dataValues.criteria = criteria;
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
