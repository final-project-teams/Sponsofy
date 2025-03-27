const { Contract, Company, Criteria, Term, Deal, Media, Post, ContentCreator, Account, pre_terms, pre_Term, SubCriteria , User, Signature , Negotiation} = require("../database/connection");

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
        budget,
        payment_terms,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        rank,
        CompanyId: company.id,
        status: 'active'
      });

      if (criteriaList && criteriaList.length > 0) {
        await Promise.all(criteriaList.map(async ({ criteria, subCriteria }) => {
          console.log('Creating criteria with platform:', criteria.platform);
          
          const createdCriteria = await Criteria.create({
            name: criteria.name,
            platform: criteria.platform,
            ContractId: contract.id
          });

          if (subCriteria) {
            await SubCriteria.create({
              name: subCriteria.name,
              description: subCriteria.description,
              CriterionId: createdCriteria.id
            });
          }
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
          status: contract.status,
          contractData: contract.contractData,
          serialNumber: contract.serialNumber,
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
  createContract : async (req, res) => {
    try {
        const { title, description, budget, start_date, end_date, CompanyId, ContentCreatorId,rank,payment_terms,status,TermId} = req.body;

        const newContract = await Contract.create({
            title,
            description,
            budget,
            start_date,
            end_date,
            CompanyId,
            ContentCreatorId,
            rank,
            payment_terms,
            status,
            TermId

        });

        res.status(201).json(newContract);
    } catch (error) {
        console.error('Error creating contract:', error);
        res.status(500).json({ message: 'Error creating contract', error });
    }
},

getContracts : async (req, res) => {
  try {
      const contracts = await Contract.findAll();
      res.json(contracts);
  } catch (error) {
      console.error('Error fetching contracts:', error);
      res.status(500).json({ message: 'Error fetching contracts', error });
  }
},

getContractById : async (req, res) => {
  try {
    const { contractId } = req.params;
    
    const contract = await Contract.findOne({
      where: { id: contractId },
      include: [
        {
          model: Company,
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email']
          }]
        },
        {
          model: Deal,
          include: [{
            model: ContentCreator,
            as: 'ContentCreatorDeals',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email']
              },
              {
                model: Account,
                as: 'accounts',
                attributes: ['platform', 'username']
              }
            ]
          }]
        },
        {
          model: pre_Term,
          attributes: ['id', 'title', 'description', 'status']
        }
      ]
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    // Get user IDs for signatures
    const companyUserId = contract.Company?.user?.id;
    const creatorUserId = contract.Deals?.[0]?.ContentCreatorDeals?.user?.id;

    // Get signatures
    const [companySignature, creatorSignature] = await Promise.all([
      companyUserId ? Signature.findOne({
        where: { userId: companyUserId },
        order: [['created_at', 'DESC']]
      }) : null,
      creatorUserId ? Signature.findOne({
        where: { userId: creatorUserId },
        order: [['created_at', 'DESC']]
      }) : null
    ]);

    // Add debug logging
    console.log('Contract data:', {
      companyEmail: contract.Company?.user?.email,
      creatorEmail: contract.Deals?.[0]?.ContentCreatorDeals?.user?.email,
      terms: contract.pre_Terms
    });

    const contractData = contract.toJSON();
    contractData.signatures = {
      companySignature,
      creatorSignature
    };

    res.status(200).json({
      success: true,
      contract: contractData
    });

  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching contract', 
      error: error.message 
    });
  }
},
getContractByCompanyId : async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Fetching contracts for userId:', userId);
    
    // First find the company associated with this user
    const company = await Company.findOne({ where: { userId: userId } });
    console.log('Found company:', company);

      if (!company) {
        return res.status(404).json({
        message: 'Company not found for this user',
        userId
        });
      }

    // Now use the company's ID to find contracts
      const contracts = await Contract.findAll({
        where: { CompanyId: company.id },
      include: [{ model: Criteria }] // Include related criteria if needed
    });
    console.log('Found contracts:', contracts);
    
    res.json(contracts);
  } catch (error) {
    console.error('Error fetching contract by company id:', error);
    res.status(500).json({ 
      message: 'Error fetching contract by company id', 
      error: error.message 
    });
  }
},
getContractByContentCreatorId : async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Fetching contracts for userId:', userId);
    
    // First find the content creator associated with this user
    const contentCreator = await ContentCreator.findOne({ where: { userId: userId } });
    console.log('Found content creator:', contentCreator);
    
    if (!contentCreator) {
      return res.status(404).json({ 
        message: 'Content creator not found for this user',
        userId
      });
    }

    // Use contentCreator.id instead of ContentCreator.id
    const contracts = await Contract.findAll({ 
      where: { ContentCreatorId: contentCreator.id },
      include: [{ model: Criteria }]
    });
    console.log('Found contracts:', contracts);
    
    res.json(contracts);
  } catch (error) {
    console.error('Error fetching contract by content creator id:', error);
    res.status(500).json({ 
      message: 'Error fetching contract by content creator id', 
      error: error.message 
    });
  }
},
// Get contract with its terms
getContractWithTerms: async (req, res) => {
  try {
    const { contractId } = req.params;
    
    const contract = await Contract.findOne({
      where: { id: contractId },
      include: [{
        model: Term,
        attributes: ['id', 'title', 'description', 'companyAccepted', 'influencerAccepted', 'status']
      }]
    });

    if (!contract) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contract not found' 
      });
    }

    res.json({
        success: true,
      contract
      });

    } catch (error) {
    console.error("Error fetching contract with terms:", error);
      res.status(500).json({
        success: false,
      message: 'Error fetching contract',
        error: error.message
      });
    }
  },

// Update term acceptance status
updateTermStatus: async (req, res) => {
  try {
    const { contractId, termId } = req.params;
    const { userRole } = req.body;

    const term = await Term.findOne({
      where: { 
        id: termId,
        ContractId: contractId
      }
    });

    if (!term) {
          return res.status(404).json({
            success: false,
        message: 'Term not found'
      });
    }

    // Update the appropriate acceptance field based on user role
    if (userRole === 'company') {
      term.companyAccepted = true;
    } else if (userRole === 'influencer') {
      term.influencerAccepted = true;
    }

    // Check if both parties have accepted
    if (term.companyAccepted && term.influencerAccepted) {
      term.status = 'accepted';
    }

    await term.save();

    res.json({
      success: true,
      message: 'Term updated successfully',
      term
    });

  } catch (error) {
    console.error("Error updating term:", error);
    res.status(500).json({
            success: false,
      message: 'Error updating term',
      error: error.message
    });
  }
},

// Add terms to a contract
addTermsToContract: async (req, res) => {
  try {
    const { contractId } = req.params;
    const { terms } = req.body;

    // Validate input
    if (!terms || !Array.isArray(terms) || terms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Terms array is required and cannot be empty'
      });
    }

    // Check if contract exists
    const contract = await Contract.findByPk(contractId);
    if (!contract) {
        return res.status(404).json({
          success: false,
        message: 'Contract not found'
      });
    }

      // Get user IDs safely
      const companyUserId = contract?.Company?.user?.id;
      const creatorUserId = contract?.ContentCreator?.user?.id;

      console.log('Found users:', {
        companyUsername: contract?.Company?.user?.username,
        creatorUsername: contract?.ContentCreator?.user?.username
      });

      // Get signatures
      const [companySignature, creatorSignature] = await Promise.all([
        companyUserId ? Signature.findOne({
          where: { userId: companyUserId },
          order: [['created_at', 'DESC']]
        }) : null,
        creatorUserId ? Signature.findOne({
          where: { userId: creatorUserId },
          order: [['created_at', 'DESC']]
        }) : null
      ]);

      const contractData = contract.toJSON();
      contractData.signatures = {
        companySignature,
        creatorSignature
      };

      res.status(200).json({
        success: true,
        contract: contractData
      });

    } catch (error) {
    console.error("Error adding terms:", error);
      res.status(500).json({
        success: false,
      message: 'Error adding terms',
        error: error.message
      });
    }
  },
updateContractStatus: async (req, res) => {
  try {
    const { contractId } = req.params;
    const { status } = req.body;
    await Contract.update({ status }, { where: { id: contractId } });
    res.json({ success: true, message: 'Contract status updated' });
  } catch (error) {
    console.error('Error updating contract status:', error);
    res.status(500).json({ success: false, message: 'Error updating contract status', error: error.message });
  }
},


gettermsbycontractid : async (req, res) => {
    try {
      const { contractId } = req.params;
    const terms = await Term.findAll({ 
        where: { ContractId: contractId },
      include: [{
        model: Negotiation,
        as: "negotiation",
        attributes: ['status', 'confirmation_company', 'confirmation_Influencer']
      }]
    });
    res.json(terms);
  } catch (error) {
    console.error('Error fetching terms:', error);
    res.status(500).json({ message: 'Error fetching terms', error });
  }
},
updateTerm: async (req, res) => {
  try {
    const { contractId, termId } = req.params;
    const { title, description } = req.body;
    
    console.log('Updating term with:', {
      contractId,
      termId,
      updates: { title, description }
    });

    // First verify the term exists
    const term = await Term.findOne({
      where: { 
        id: termId,
        ContractId: contractId 
      }
    });

    if (!term) {
      console.log('Term not found:', { termId, contractId });
        return res.status(404).json({
          success: false,
        message: 'Term not found'
      });
    }

    // Perform the update
    await term.update({
      title,
      description
    });

    // Fetch the fresh term to confirm update
    const updatedTerm = await Term.findOne({
      where: { 
        id: termId,
        ContractId: contractId 
      }
    });

    console.log('Updated term:', updatedTerm.toJSON());

    return res.json({
      success: true,
      message: 'Term updated successfully',
      term: updatedTerm
    });

  } catch (error) {
    console.error('Error in updateTerm:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update term',
      error: error.message
    });
  }
},
acceptTerm: async (req, res) => {
  try {
    const { contractId, termId } = req.params;
    const { userRole } = req.body;
    
    // Find or create negotiation for this term
    const [negotiation, created] = await Negotiation.findOrCreate({
      where: { TermId: termId },
      defaults: {
        status: 'pending',
        confirmation_company: false,
        confirmation_Influencer: false,
        TermId: termId
      }
    });

    // Update the appropriate confirmation based on user role
    if (userRole === 'company') {
      negotiation.confirmation_company = true;
    } else if (userRole === 'influencer') {
      negotiation.confirmation_Influencer = true;
    }

    // Check if both parties have confirmed
    if (negotiation.confirmation_company && negotiation.confirmation_Influencer) {
      negotiation.status = 'completed';
      
      // Update the term status
      await Term.update(
        { status: 'accepted' },
        { where: { id: termId } }
      );
    }

    await negotiation.save();

    res.json({ 
        success: true,
      message: 'Term acceptance updated',
      negotiation: negotiation
      });

    } catch (error) {
    console.error('Error accepting term:', error);
      res.status(500).json({
        success: false,
      message: 'Error accepting term', 
        error: error.message
      });
    }
},
  }