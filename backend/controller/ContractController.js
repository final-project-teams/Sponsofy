const { Contract } = require('../database/connection');

module.exports = {
    getContract: async (req, res) => {
        const contracts = await Contract.findAll();
        res.status(200).json(contracts);
    },
    
    postContract: async (req, res) => {
        const contract = await Contract.create(req.body);
        res.status(201).json(contract);
    },
    updateContract: async (req, res) => {
        const contract = await Contract.update(req.body, { where: { id: req.params.id } });
        res.status(200).json(contract);
    },
    deleteContract: async (req, res) => {
        const contract = await Contract.destroy({ where: { id: req.params.id } });
        res.status(200).json(contract);
    }
}