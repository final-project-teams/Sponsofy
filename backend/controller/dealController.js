const { Deal, Contract, ContentCreator, User, Company, Notification, Term } = require("../database/connection");
// Comment out socket import
// const { io } = require('../server/server');

const dealController = {
  // Create a new deal request from content creator to company
  createDealRequest: async (req, res) => {
    try {
      const { contractId, price, terms } = req.body;
      const userId = req.user.userId;
      
      // Find the content creator
      const contentCreator = await ContentCreator.findOne({
        where: { userId },
        include: [{ model: User, as: 'user' }]
      });
      
      if (!contentCreator) {
        return res.status(404).json({
          success: false,
          message: 'Content creator profile not found'
        });
      }
      
      // Find the contract with company information
      const contract = await Contract.findByPk(contractId, {
        include: [{ 
          model: Company,
          include: [{ model: User, as: 'user' }]
        }]
      });
      
      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contract not found'
        });
      }
      
      // Check if a deal already exists
      const existingDeal = await Deal.findOne({
        where: {
          contentCreatorId: contentCreator.id,
          ContractId: contractId
        }
      });
      
      if (existingDeal) {
        return res.status(400).json({
          success: false,
          message: 'A deal already exists for this contract'
        });
      }
      
      // Create the deal with pending status
      const deal = await Deal.create({
        contentCreatorId: contentCreator.id,
        ContractId: contractId,
        deal_terms: contract.payment_terms || "Standard terms",
        price: price || contract.amount || 0,
        status: 'pending' // Initial status is pending
      });
      
      // Create terms if provided
      if (terms && terms.length > 0) {
        await Promise.all(terms.map(term => {
          return Term.create({
            title: term.title,
            description: term.description || '',
            status: 'negotiating',
            DealId: deal.id
          });
        }));
      }
      
      // Get the created deal with all related data
      const createdDeal = await Deal.findOne({
        where: { id: deal.id },
        include: [
          {
            model: Contract,
            include: [
              {
                model: Company,
                include: [{ model: User, as: 'user' }],
                attributes: ['id', 'name', 'industry', 'codeFiscal', 'category']
              }
            ],
            attributes: ['id', 'title', 'description', 'start_date', 'end_date', 'status', 'payment_terms', 'rank']
          },
          {
            model: Term,
            attributes: ['id', 'title', 'description', 'status']
          },
          {
            model: ContentCreator,
            as:"ContentCreatorDeals",
            attributes: ['id', 'first_name', 'last_name', 'bio', 'pricing', 'portfolio_links', 'location', 'category', 'verified', 'isPremium', 'profile_picture']
          }
        ]
      });
      
      // Get company user ID for notification
      const companyUserId = contract.Company?.user?.id;
      
      if (companyUserId) {
        try {
          // Create notification data
          const notificationData = {
            userId: companyUserId,
            message: `${contentCreator.user.username || 'A content creator'} has requested a deal for your contract "${contract.title}"`,
            type: 'deal_request',
            link: `/deals/${deal.id}`,
            timestamp: new Date()
          };
          
          // Save notification to database
          await Notification.create({
            userId: companyUserId,
            message: notificationData.message,
            type: notificationData.type,
            link: notificationData.link,
            read: false
          });
          
          // Comment out socket notification
          /*
          // Send real-time notification via socket.io
          io.of('/notification').to(companyUserId.toString()).emit('new_notification', notificationData);
          
          // Also emit to the deal namespace
          io.of('/deal').to(companyUserId.toString()).emit('new_deal_request', {
            dealId: deal.id,
            contractId: contract.id,
            contentCreatorId: contentCreator.id,
            contentCreatorName: contentCreator.user.username || 'A content creator',
            contractTitle: contract.title,
            timestamp: new Date()
          });
          */
        } catch (notificationError) {
          console.error('Error saving notification:', notificationError);
        }
      }
      
      res.status(201).json({
        success: true,
        message: 'Deal request sent successfully',
        deal: createdDeal
      });
      
    } catch (error) {
      console.error("Error creating deal request:", error);
      res.status(500).json({
        success: false,
        message: 'Error creating deal request',
        error: error.message
      });
    }
  },
  
  // Accept a deal (by company)
  acceptDeal: async (req, res) => {
    try {
      const { dealId } = req.body;
      const userId = req.user.userId;
      
      // Find the company
      const company = await Company.findOne({
        where: { userId },
        include: [{ model: User, as: 'user' }]
      });
      
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company profile not found'
        });
      }
      
      // Find the deal with related information
      const deal = await Deal.findByPk(dealId, {
        include: [
          { 
            model: Contract,
            include: [{ model: Company }]
          },
          {
            model: ContentCreator,
            as: 'ContentCreatorDeals',
            include: [{ model: User, as: 'user' }]
          }
        ]
      });
      
      if (!deal) {
        return res.status(404).json({
          success: false,
          message: 'Deal not found'
        });
      }
      
      // Verify that the company owns the contract
      if (deal.Contract.Company.id !== company.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to accept this deal'
        });
      }
      
      // Update the deal status to accepted
      deal.status = 'accepted';
      await deal.save();
      
      // Get content creator user ID for notification
      const contentCreatorUserId = deal.ContentCreatorDeals?.user?.id;
      
      if (contentCreatorUserId) {
        try {
          // Create notification data
          const notificationData = {
            userId: contentCreatorUserId,
            message: `${company.name || 'A company'} has accepted your deal request for contract "${deal.Contract.title}"`,
            type: 'deal_accepted',
            link: `/deals/${deal.id}`,
            timestamp: new Date()
          };
          
          // Save notification to database
          await Notification.create({
            userId: contentCreatorUserId,
            message: notificationData.message,
            type: notificationData.type,
            link: notificationData.link,
            read: false
          });
          
          // Comment out socket notification
          /*
          // Send real-time notification via socket.io
          io.of('/notification').to(contentCreatorUserId.toString()).emit('new_notification', notificationData);
          
          // Also emit to the deal namespace
          io.of('/deal').to(contentCreatorUserId.toString()).emit('deal_accepted', {
            dealId: deal.id,
            contractId: deal.Contract.id,
            companyName: company.name || 'A company',
            contractTitle: deal.Contract.title,
            timestamp: new Date()
          });
          */
        } catch (notificationError) {
          console.error('Error saving notification:', notificationError);
        }
      }
      
      res.status(200).json({
        success: true,
        message: 'Deal accepted successfully',
        deal: {
          id: deal.id,
          status: deal.status
        }
      });
      
    } catch (error) {
      console.error("Error accepting deal:", error);
      res.status(500).json({
        success: false,
        message: 'Error accepting deal',
        error: error.message
      });
    }
  },
  
  // Reject a deal (by company)
  rejectDeal: async (req, res) => {
    try {
      const { dealId, reason } = req.body;
      const userId = req.user.userId;
      
      // Find the company
      const company = await Company.findOne({
        where: { userId },
        include: [{ model: User, as: 'user' }]
      });
      
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company profile not found'
        });
      }
      
      // Find the deal with related information
      const deal = await Deal.findByPk(dealId, {
        include: [
          { 
            model: Contract,
            include: [{ model: Company }]
          },
          {
            model: ContentCreator,
            as: 'ContentCreatorDeals',
            include: [{ model: User, as: 'user' }]
          }
        ]
      });
      
      if (!deal) {
        return res.status(404).json({
          success: false,
          message: 'Deal not found'
        });
      }
      
      // Verify that the company owns the contract
      if (deal.Contract.Company.id !== company.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to reject this deal'
        });
      }
      
      // Update the deal status to rejected
      deal.status = 'rejected';
      await deal.save();
      
      // Get content creator user ID for notification
      const contentCreatorUserId = deal.ContentCreatorDeals?.user?.id;
      
      if (contentCreatorUserId) {
        try {
          // Create notification data
          const notificationData = {
            userId: contentCreatorUserId,
            message: `${company.name || 'A company'} has rejected your deal request for contract "${deal.Contract.title}"${reason ? `: ${reason}` : ''}`,
            type: 'deal_rejected',
            link: `/deals/${deal.id}`,
            timestamp: new Date()
          };
          
          // Save notification to database
          await Notification.create({
            userId: contentCreatorUserId,
            message: notificationData.message,
            type: notificationData.type,
            link: notificationData.link,
            read: false
          });
          
          // Comment out socket notification
          /*
          // Send real-time notification via socket.io
          io.of('/notification').to(contentCreatorUserId.toString()).emit('new_notification', notificationData);
          
          // Also emit to the deal namespace
          io.of('/deal').to(contentCreatorUserId.toString()).emit('deal_rejected', {
            dealId: deal.id,
            contractId: deal.Contract.id,
            companyName: company.name || 'A company',
            contractTitle: deal.Contract.title,
            reason: reason || '',
            timestamp: new Date()
          });
          */
        } catch (notificationError) {
          console.error('Error saving notification:', notificationError);
        }
      }
      
      res.status(200).json({
        success: true,
        message: 'Deal rejected successfully',
        deal: {
          id: deal.id,
          status: deal.status
        }
      });
      
    } catch (error) {
      console.error("Error rejecting deal:", error);
      res.status(500).json({
        success: false,
        message: 'Error rejecting deal',
        error: error.message
      });
    }
  },
  
  // Get all deals for a content creator
  getContentCreatorDeals: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      // Find the content creator
      const contentCreator = await ContentCreator.findOne({
        where: { userId }
      });
      
      if (!contentCreator) {
        return res.status(404).json({
          success: false,
          message: 'Content creator profile not found'
        });
      }
      
      // Find all deals for this content creator
      const deals = await Deal.findAll({
        where: { contentCreatorId: contentCreator.id },
        include: [
          {
            model: Contract,
            include: [{ model: Company }]
          },
          {
            model: Term
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      res.status(200).json({
        success: true,
        deals
      });
      
    } catch (error) {
      console.error("Error fetching content creator deals:", error);
      res.status(500).json({
        success: false,
        message: 'Error fetching deals',
        error: error.message
      });
    }
  },
  
  // Get all deals for a company
  getCompanyDeals: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      // Find the company
      const company = await Company.findOne({
        where: { userId }
      });
      
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company profile not found'
        });
      }
      
      // Find all contracts for this company
      const contracts = await Contract.findAll({
        where: { CompanyId: company.id },
        attributes: ['id']
      });
      
      const contractIds = contracts.map(contract => contract.id);
      
      // Find all deals for these contracts
      const deals = await Deal.findAll({
        where: { ContractId: contractIds },
        include: [
          {
            model: Contract
          },
          {
            model: ContentCreator,
            as: 'ContentCreatorDeals',
            include: [{ model: User, as: 'user' }]
          },
          {
            model: Term
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      res.status(200).json({
        success: true,
        deals
      });
      
    } catch (error) {
      console.error("Error fetching company deals:", error);
      res.status(500).json({
        success: false,
        message: 'Error fetching deals',
        error: error.message
      });
    }
  },
  
  // Get a specific deal by ID
  getDealById: async (req, res) => {
    try {
      const { dealId } = req.params;
      
      const deal = await Deal.findByPk(dealId, {
        include: [
          {
            model: Contract,
            include: [{ model: Company }]
          },
          {
            model: ContentCreator,
            as: 'ContentCreatorDeals',
            include: [{ model: User, as: 'user' }]
          },
          {
            model: Term
          }
        ]
      });
      
      if (!deal) {
        return res.status(404).json({
          success: false,
          message: 'Deal not found'
        });
      }
      
      res.status(200).json({
        success: true,
        deal
      });
      
    } catch (error) {
      console.error("Error fetching deal:", error);
      res.status(500).json({
        success: false,
        message: 'Error fetching deal',
        error: error.message
      });
    }
  }
};

module.exports = dealController;