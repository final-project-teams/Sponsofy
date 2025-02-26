const { Op } = require('sequelize');
const { Company ,ContentCreator,Account} = require('../database/models');

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
  searchContentCreators
};