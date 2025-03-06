const { ContentCreator } = require("../database/connection");

const createContentCreator = async (req, res) => {
    const { name, email, password } = req.body;
    const contentCreator = await ContentCreator.create({ name, email, password });
    res.status(201).json(contentCreator);
};

const getContentCreator = async (req, res) => {
    const contentCreator = await ContentCreator.findAll();
    res.status(200).json(contentCreator);
};
const getContentCreatorById = async (req, res) => {
    const contentCreator = await ContentCreator.findByPk(req.params.id);
    res.status(200).json(contentCreator);
};

const updateContentCreator = async (req, res) => {
    const contentCreator = await ContentCreator.findByPk(req.params.id);
    await contentCreator.update(req.body);
    res.status(200).json(contentCreator);
};

const deleteContentCreator = async (req, res) => {
    const contentCreator = await ContentCreator.findByPk(req.params.id);
    await contentCreator.destroy();
    res.status(200).json({ message: "Content Creator deleted successfully" });
};

module.exports = { createContentCreator, getContentCreator, getContentCreatorById, updateContentCreator, deleteContentCreator };