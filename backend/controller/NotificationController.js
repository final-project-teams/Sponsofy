const Notification = require('../database/models/notification');
const Contract = require('../database/models/contract');
const { sendPushNotification } = require('../services/notificationService'); // Optional: For push notifications
const { sendEmail } = require('../services/emailService'); // Optional: For email notifications

// Send notification to influencer when contract is updated
exports.sendContractUpdateNotification = async (contractId) => {
    try {
        const contract = await Contract.findById(contractId);
        if (!contract) {
            throw new Error('Contract not found');
        }

        // Create a new notification
        const notification = new Notification({
            userId: contract.influencerId, // Assuming influencerId is stored in the contract
            message: 'The contract has been updated. Please review the new terms.',
            type: 'contract_update',
            read: false,
        });
        await notification.save();

        // Optional: Send push notification
        await sendPushNotification(contract.influencerId, 'Contract Updated', 'Please review the new terms.');

        // Optional: Send email notification
        await sendEmail(contract.influencerEmail, 'Contract Updated', 'Please review the new terms.');

        return notification;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
};

// Mark a notification as read
exports.markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read', error });
    }
};

// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
};