const { Contract, Company, Criteria, Term } = require("../database/connection");

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

      // Retrieve all contracts associated with the company, including criteria and terms
      const contracts = await Contract.findAll({
        where: { CompanyId: company.id },
        include: [
          { model: Criteria, as: 'criteria' },
      
        ]
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
  }
};
