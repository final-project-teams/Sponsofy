const { Contract } = require('../database/connection');
const { Op } = require('sequelize'); // Import Op from Sequelize
const { sendPushNotification } = require('../services/notificationService'); // No curly braces

// Fetch contracts for a specific user (company or influencer)
exports.getContracts = async (req, res) => {
    try {
        const contracts = await Contract.findAll();
        res.json(contracts);
    } catch (error) {
        console.error('Error fetching contracts:', error);
        res.status(500).json({ message: 'Error fetching contracts', error });
    }
};

// Accept a contract
exports.acceptContract = async (req, res) => {
    try {
        const { contractId } = req.params;
        const { userId } = req.body; // userId is the influencerId

        // Find the contract
        const contract = await Contract.findByPk(contractId);
        if (!contract) {
            return res.status(404).json({ message: 'Contract not found' });
        }

        // Check if the user is the influencer associated with the contract
        if (contract.contentId !== userId) {
            return res.status(403).json({ message: 'You are not authorized to accept this contract' });
        }

        // Update the contract status to accepted
        await contract.update({ accepted: true });

        // Notify the company about the acceptance
        await sendPushNotification(contract.companyId, 'Contract Accepted', 'The contract has been accepted by the influencer.');

        res.json({ message: 'Contract accepted successfully', contract });
    } catch (error) {
        console.error('Error accepting contract:', error);
        res.status(500).json({ message: 'Error accepting contract', error });
    }
};

// Example function to create a contract
exports.createContract = async (req, res) => {
    try {
        const { title, description, start_date, end_date, CompanyId, ContentCreatorId } = req.body;

        const newContract = await Contract.create({
            title,
            description,
            start_date,
            end_date,
            CompanyId,
            ContentCreatorId, // Ensure this is included
        });

        res.status(201).json(newContract);
    } catch (error) {
        console.error('Error creating contract:', error);
        res.status(500).json({ message: 'Error creating contract', error });
    }

};
exports.getContractbyCompanyId = async (req, res) => {
    const { companyId } = req.params;
    const contracts = await Contract.findAll({ where: { CompanyId: companyId } });
    res.json(contracts);
};
exports.getContractbyContentCreatorId = async (req, res) => {
    const { ContentCreatorId } = req.params;
    const contracts = await Contract.findAll({ where: { ContentCreatorId: ContentCreatorId } });
    res.json(contracts);
};
exports.getContractbyDealId = async (req, res) => {
    const { DealId } = req.params;
    const contracts = await Contract.findAll({ where: { DealId: DealId } });
    res.json(contracts);
};


