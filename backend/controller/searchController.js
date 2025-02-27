const { Op } = require('sequelize');
const { Company ,ContentCreator,Account ,Contract} = require('../database/connection');

// Search Companies with filters
const searchCompanies = async (req, res) => {
    try {
      const {
        query,          // Search query for name/industry
        location,       // Location filter
        industry,       // Industry filter
        category,       // Category filter
        isPremium,      // Premium status filter
        verified        // Verification status filter
      } = req.query;

      const whereClause = {};

      // Basic search conditions
      if (query) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${query}%` } }, // Change ILIKE to LIKE
          { industry: { [Op.like]: `%${query}%` } }, // Change ILIKE to LIKE
          { description: { [Op.like]: `%${query}%` } } // Change ILIKE to LIKE
        ];
      }

      // Apply filters
      if (location) whereClause.location = { [Op.like]: `%${location}%` }; // Change ILIKE to LIKE
      if (industry) whereClause.industry = { [Op.like]: `%${industry}%` }; // Change ILIKE to LIKE
      if (category) whereClause.category = { [Op.like]: `%${category}%` }; // Change ILIKE to LIKE
      if (isPremium !== undefined) whereClause.isPremium = isPremium;
      if (verified !== undefined) whereClause.verified = verified;

      const companies = await Company.findAll({
        where: whereClause,
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        limit: 20
      });

      res.json({ success: true, data: companies });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
const searchContracts = async (req, res) => {
  try {
    const { query, rank } = req.query; // Get the search query and rank filter

    const whereClause = {};
    if (query) {
      whereClause.title = { [Op.like]: `%${query}%` }; // Search by title only
    }

    const contracts = await Contract.findAll({
      where: whereClause,
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      limit: 20
    });

    // Group contracts by rank
    const groupedContracts = contracts.reduce((acc, contract) => {
      const rankKey = contract.rank; // Get the rank of the contract
      if (!acc[rankKey]) {
        acc[rankKey] = []; // Initialize an array for this rank if it doesn't exist
      }
      acc[rankKey].push(contract); // Push the contract into the appropriate rank group
      return acc;
    }, {});

    res.json({ success: true, data: groupedContracts }); // Return grouped contracts
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
const searchContractsByRank = async (req, res) => {
  try {
    const { rank } = req.query;
    const contracts = await Contract.findAll({
      where: { rank },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      limit: 20
    });

    res.json({ success: true, data: contracts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// Search Content Creators with filters
const searchContentCreators = async (req, res) => {
  try {
    const {
      query,          // Search query for name/bio
      location,       // Location filter
      platform,       // Social media platform filter
      minPrice,       // Minimum price filter
      maxPrice,       // Maximum price filter
      isPremium,      // Premium status filter
      verified        // Verification status filter
    } = req.query;

    const whereClause = {};

    // Basic search conditions
    if (query) {
      whereClause[Op.or] = [
        { first_name: { [Op.iLike]: `%${query}%` } },
        { last_name: { [Op.iLike]: `%${query}%` } },
        { bio: { [Op.iLike]: `%${query}%` } }
      ];
    }

    // Apply filters
    if (location) whereClause.location = { [Op.iLike]: `%${location}%` };
    if (isPremium !== undefined) whereClause.isPremium = isPremium;
    if (verified !== undefined) whereClause.verified = verified;
    if (minPrice || maxPrice) {
      whereClause.pricing = {};
      if (minPrice) whereClause.pricing[Op.gte] = minPrice;
      if (maxPrice) whereClause.pricing[Op.lte] = maxPrice;
    }

    const creators = await ContentCreator.findAll({
      where: whereClause,
      include: [{
        model: Account,
        as: 'accounts',
        where: platform ? { platform } : {},
        required: false
      }],
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      limit: 20
    });

    res.json({ success: true, data: creators });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  searchCompanies,
  searchContentCreators,
  searchContracts,
  searchContractsByRank
};