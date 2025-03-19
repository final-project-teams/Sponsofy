const { Contract, Company, Criteria, Term , Deal,Media,Post,ContentCreator,Account, User} = require("../database/connection");

module.exports = {
  addContract: async (req, res) => {
    try {
      const decoded = req.user;
      console.log("decodedaaa", decoded);
      
      const { title, description, budget, start_date, end_date, payment_terms, rank, criteriaList } = req.body;

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

  // Enhance this method to get deals by contract ID
  getDealsByContractId: async (req, res) => {
    try {
      const { contractId } = req.params;
      const decoded = req.user;
      
      console.log(`Fetching deals for contract ID: ${contractId}`);
      console.log(`User ID from token: ${decoded.userId}, role: ${decoded.role}`);
      
      // First verify the contract exists
      const contract = await Contract.findByPk(contractId);
      
      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contract not found'
        });
      }
      
      // Verify if the user has access to this contract's deals
      // If the user is a company, they should only access deals for their own contracts
      if (decoded.role === 'company') {
        const userCompany = await Company.findOne({ where: { userId: decoded.userId } });
        
        if (!userCompany) {
          return res.status(404).json({
            success: false,
            message: 'Company not found for this user'
          });
        }
        
        // Check if the requested contract belongs to the user's company
        if (contract.CompanyId.toString() !== userCompany.id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to access deals for this contract'
          });
        }
      } else if (decoded.role === 'creator') {
        // If user is a content creator, they should only see deals they're involved in
        // This would require further checks based on your application logic
        // For example, checking if there are any deals with this creator for this contract
        const contentCreator = await ContentCreator.findOne({ where: { userId: decoded.userId } });
        
        if (!contentCreator) {
          return res.status(404).json({
            success: false,
            message: 'Content creator profile not found'
          });
        }
        
        // You could check if this creator has any deals with this contract
        const creatorHasDeals = await Deal.findOne({
          where: { 
            ContractId: contractId,
            contentCreatorId: contentCreator.id
          }
        });
        
        if (!creatorHasDeals) {
          return res.status(403).json({
            success: false,
            message: 'You do not have any deals associated with this contract'
          });
        }
      }
      
      // Fetch the deals with all the related data
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
              },
              {
                model: User,
                as: 'user',
                attributes: ['username', 'email']
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
      
      // Return empty array instead of 404 if no deals found
      if (!deals.length) {
        console.log(`No deals found for contract ID: ${contractId}`);
        return res.status(200).json({
          success: true,
          message: 'No deals found for this contract',
          deals: []
        });
      }
      
      console.log(`Found ${deals.length} deals for contract ID: ${contractId}`);
      
      // Return the deals along with the contract summary
      res.status(200).json({
        success: true,
        contractSummary: {
          id: contract.id,
          title: contract.title,
          status: contract.status
        },
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
  },

  // Add this new method to get a single contract by ID
  getContractById: async (req, res) => {
    try {
      const { id } = req.params;
      const decoded = req.user;

      console.log(`Fetching contract with ID: ${id}`);
      console.log(`User ID from token: ${decoded.userId}`);

      // Find the contract with its associated data
      const contract = await Contract.findByPk(id, {
        include: [
          { 
            model: Criteria,
            as: 'criteria'
          },
          {
            model: Company,
            attributes: ['id', 'name', 'industry', 'location', 'verified']
          }
        ]
      });

      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contract not found'
        });
      }

      // Verify if the user has access to this contract
      // If the user is a company, they should only access their own contracts
      if (decoded.role === 'company') {
        const userCompany = await Company.findOne({ where: { userId: decoded.userId } });
        
        if (!userCompany) {
          return res.status(404).json({
            success: false,
            message: 'Company not found for this user'
          });
        }

        // Check if the requested contract belongs to the user's company
        if (contract.CompanyId.toString() !== userCompany.id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to access this contract'
          });
        }
      }

      res.status(200).json({
        success: true,
        contract
      });

    } catch (error) {
      console.error("Error fetching contract by ID:", error);
      res.status(500).json({
        success: false,
        message: 'Error fetching contract',
        error: error.message
      });
    }
  },

  // Add this new method to get a contract with its deals in a single request
  getContractWithDeals: async (req, res) => {
    try {
      const { id } = req.params;
      const decoded = req.user;

      console.log(`Fetching contract with deals for ID: ${id}`);
      console.log(`User ID from token: ${decoded.userId}, role: ${decoded.role}`);

      // Find the contract with its associated data
      const contract = await Contract.findByPk(id, {
        include: [
          { 
            model: Criteria,
            as: 'criteria'
          },
          {
            model: Company,
            attributes: ['id', 'name', 'industry', 'location', 'verified']
          }
        ]
      });

      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contract not found'
        });
      }

      // Verify if the user has access to this contract
      // If the user is a company, they should only access their own contracts
      if (decoded.role === 'company') {
        const userCompany = await Company.findOne({ where: { userId: decoded.userId } });
        
        if (!userCompany) {
          return res.status(404).json({
            success: false,
            message: 'Company not found for this user'
          });
        }

        // Check if the requested contract belongs to the user's company
        if (contract.CompanyId.toString() !== userCompany.id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to access this contract'
          });
        }
      }

      // Fetch the deals for this contract
      const deals = await Deal.findAll({
        where: { ContractId: id },
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
              },
              {
                model: User,
                as: 'user',
                attributes: ['username', 'email']
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

      // Return both the contract and its deals
      res.status(200).json({
        success: true,
        contract,
        deals: deals || []
      });

    } catch (error) {
      console.error("Error fetching contract with deals:", error);
      res.status(500).json({
        success: false,
        message: 'Error fetching contract with deals',
        error: error.message
      });
    }
  }
};
