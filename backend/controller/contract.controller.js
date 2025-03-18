const { Contract, Company, Criteria, Term , Deal,Media,Post,ContentCreator,Account , pre_terms, pre_Term} = require("../database/connection");

module.exports = {
  addContract: async (req, res) => {
    try {
      const decoded = req.user;
      console.log("decodedaaa", decoded);
      
      const { title, description, budget, start_date, end_date, payment_terms, rank, criteriaList, termsList } = req.body;

      const company = await Company.findOne({ where: { userId: decoded.userId } });
      console.log("companyaaaa", company);
      
      const contract = await Contract.create({
        title,
        description,
        amount: budget,
        payment_terms,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        rank,
        CompanyId: company.id,
        status: 'active'
      });

      if (criteriaList && criteriaList.length > 0) {
        await Promise.all(criteriaList.map(criteria => {
          return Criteria.create({
            name: criteria.name,
            description: criteria.description,
            ContractId: contract.id
          });
        }));
      }

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

      res.status(201).json({
        success: true,
        message: 'Contract created successfully',
        contract: {
          id: contract.id,
          title,
          status: contract.status
        }
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

  getContractsForCurrentCompany: async (req, res) => {
    try {
      const decoded = req.user;

      // Find the company associated with the user
      const company = await Company.findOne({ where: { userId: decoded.userId } });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }

      // Retrieve all contracts associated with the company, including criteria
      const contracts = await Contract.findAll({
        where: { CompanyId: company.id },
        include: [
          { 
            model: Criteria,
            as: 'criteria'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        contracts
      });

    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({
        success: false,
        message: 'Error fetching contracts',
        error: error.message
      });
    }
  },

  // New method to get contracts by company ID
  getContractsByCompanyId: async (req, res) => {
    try {
      const { id } = req.params;
      const decoded = req.user;

      console.log(`Fetching contracts for company ID: ${id}`);
      console.log(`User ID from token: ${decoded.userId}`);

      // Verify if the user has access to this company's contracts
      // If the user is a company, they should only access their own contracts
      if (decoded.role === 'company') {
        const userCompany = await Company.findOne({ where: { userId: decoded.userId } });
        
        if (!userCompany) {
          return res.status(404).json({
            success: false,
            message: 'Company not found for this user'
          });
        }

        // Check if the requested company ID matches the user's company ID
        if (userCompany.id.toString() !== id) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to access these contracts'
          });
        }
      }

      // Find the company
      const company = await Company.findByPk(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }

      // Retrieve all contracts associated with the company, including criteria
      const contracts = await Contract.findAll({
        where: { CompanyId: id },
        include: [
          { 
            model: Criteria,
            as: 'criteria'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        company: {
          id: company.id,
          name: company.name
        },
        contracts
      });

    } catch (error) {
      console.error("Error fetching contracts by company ID:", error);
      res.status(500).json({
        success: false,
        message: 'Error fetching contracts',
        error: error.message
      });
    }
  },

  // Add this new method to get deals by contract ID
  getDealsByContractId: async (req, res) => {
    try {
      const { contractId } = req.params;
      
      const deals = await Deal.findAll({
        where: { ContractId: contractId },
        include: [
          {
            model: Term,
            include: [
              {
                model: Media
              },
              {
                model: Post
              }
            ]
          },
          {
            model: ContentCreator,
            as: 'ContentCreatorDeals',
            include: [
              {
                model: Media,
                as: 'ProfilePicture'
              },
              {
                model: Account,
                as: 'accounts'
              }
            ]
          },
          {
            model: Media,
            as: 'AttachedMedia'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      if (!deals.length) {
        return res.status(404).json({
          success: false,
          message: 'No deals found for this contract'
        });
      }

      res.status(200).json({
        success: true,
        deals
      });

    } catch (error) {
      console.error("Error fetching deals by contract ID:", error);
      res.status(500).json({
        success: false,
        message: 'Error fetching deals',
        error: error.message
      });
    }
  }
};
