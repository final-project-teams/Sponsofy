const { Contract, Criteria, SubCriteria } = require('../database/connection');

module.exports = {
    getContract: async (req, res) => {
        try {
            const contracts = await Contract.findAll({
                include: [{
                    model: Criteria,
                    include: [SubCriteria]
                }],
                order: [['createdAt', 'DESC']], // Newest contracts first
            });
            res.status(200).json(contracts);
        } catch (error) {
            console.error("Error fetching contracts:", error);
            res.status(500).json({ error: error.message });
        }
    },
    
    postContract: async (req, res) => {
        try {
            const { 
                title, 
                description, 
                budget, 
                start_date, 
                end_date, 
                payment_terms, 
                rank,
                company_id,
                criteria // Array of criteria if provided
            } = req.body;

            // Create the contract
            const contract = await Contract.create({
                title,
                description,
                budget,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                payment_terms,
                rank,
                company_id,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // If criteria are provided, create them
            if (criteria && Array.isArray(criteria)) {
                const criteriaPromises = criteria.map(async (criterion) => {
                    const createdCriteria = await Criteria.create({
                        name: criterion.name,
                        description: criterion.description,
                        ContractId: contract.id
                    });

                    if (criterion.subCriteria) {
                        await SubCriteria.create({
                            name: criterion.subCriteria,
                            description: criterion.subCriteriaDescription,
                            CriteriaId: createdCriteria.id
                        });
                    }
                });

                await Promise.all(criteriaPromises);
            }

            // Fetch the created contract with its relations
            const contractWithRelations = await Contract.findOne({
                where: { id: contract.id },
                include: [{
                    model: Criteria,
                    include: [SubCriteria]
                }]
            });

            res.status(201).json(contractWithRelations);
        } catch (error) {
            console.error("Error creating contract:", error);
            res.status(500).json({ error: error.message });
        }
    },

    updateContract: async (req, res) => {
        try {
            const { id } = req.params;
            const contract = await Contract.update(req.body, { 
                where: { id },
                returning: true
            });
            
            // Fetch updated contract with relations
            const updatedContract = await Contract.findOne({
                where: { id },
                include: [{
                    model: Criteria,
                    include: [SubCriteria]
                }]
            });

            res.status(200).json(updatedContract);
        } catch (error) {
            console.error("Error updating contract:", error);
            res.status(500).json({ error: error.message });
        }
    },

    deleteContract: async (req, res) => {
        try {
            const { id } = req.params;
            await Contract.destroy({ where: { id } });
            res.status(200).json({ message: "Contract deleted successfully" });
        } catch (error) {
            console.error("Error deleting contract:", error);
            res.status(500).json({ error: error.message });
        }
    }
};