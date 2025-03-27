const { Contract, Company, User, Deal, ContentCreator } = require("../database/connection");

module.exports = {
  verifyContract: async (req, res) => {
    try {
      const { serialNumber } = req.params;

      const deal = await Deal.findOne({
        include: [
          {
            model: Contract,
            where: { serialNumber },
            include: [{
              model: Company,
              include: [{
                model: User,
                as: 'user',
                attributes: ['username', 'email']
              }]
            }]
          },
          {
            model: ContentCreator,
            as: 'ContentCreatorDeals',
            include: [{
              model: User,
              as: 'user',
              attributes: ['username', 'email']
            }]
          }
        ]
      });

      if (!deal || !deal.Contract) {
        return res.status(404).json({
          success: false,
          message: 'Contract not found'
        });
      }

      res.json({
        success: true,
        contract: {
          id: deal.Contract.id,
          serialNumber: deal.Contract.serialNumber,
          title: deal.Contract.title,
          status: deal.Contract.status,
          createdAt: deal.Contract.createdAt,
          budget: deal.Contract.budget,
          rank: deal.Contract.rank,
          dealStatus: deal.status,
          company: {
            name: deal.Contract.Company?.name,
            username: deal.Contract.Company?.user?.username,
            email: deal.Contract.Company?.user?.email,
            industry: deal.Contract.Company?.industry,
            verified: deal.Contract.Company?.verified
          },
          contentCreator: {
            username: deal.ContentCreatorDeals?.user?.username,
            email: deal.ContentCreatorDeals?.user?.email,
            verified: deal.ContentCreatorDeals?.verified,
            category: deal.ContentCreatorDeals?.category
          }
        }
      });

    } catch (error) {
      console.error('Error verifying contract:', error);
      res.status(500).json({
        success: false,
        message: 'Error verifying contract',
        error: error.message
      });
    }
  }
};

