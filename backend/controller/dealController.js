const { Deal, Contract, ContentCreator, User, Company ,Notification} = require("../database/connection");
const { io } = require('../socket'); // Import the io instance from your socket.js

const dealController = {
  // Existing functions...

  acceptDeal: async (req, res) => {
    try {
      const { contractId, price } = req.body;
      
      // Log the request data for debugging
      console.log("Accept Deal Request:", {
        userId: req.user.userId,
        contractId,
        price
      });
      
      // Verify user exists and has content creator role
      const user = await User.findByPk(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Find the content creator profile
      const contentCreator = await ContentCreator.findOne({ 
        where: { userId: req.user.userId },
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
        include: [{ model: Company, include: [{ model: User, as: 'user' }] }]
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
      
      // Create the deal
      const deal = await Deal.create({
        contentCreatorId: contentCreator.id,
        ContractId: contractId,
        deal_terms: contract.payment_terms || "Standard terms",
        price: price || contract.amount || 0,
        status: 'accepted'
      });
      
      // Get company user ID for notification
      const companyUserId = contract.Company?.user?.id;
      
      if (companyUserId) {
        // Send real-time notification to the company
        const notificationData = {
          userId: companyUserId,
          message: `${contentCreator.user.username || 'A content creator'} has accepted your contract "${contract.title}"`,
          type: 'deal_accepted',
          link: `/deals/${deal.id}`,
          timestamp: new Date()
        };
        
        console.log('Sending notification:', notificationData);
        
        // Use the notification namespace
        const notificationIo = io.of('/notification');
        notificationIo.to(companyUserId.toString()).emit('new_notification', notificationData);
        
        // Also save notification to database if you have a Notification model
        await Notification.create({
          userId: companyUserId,
          message: notificationData.message,
          type: notificationData.type,
          link: notificationData.link,
          read: false
        });
      }
      
      res.status(201).json({
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
  }
};

module.exports = dealController;