// backend/services/notificationService.js
const { User } = require('../database/connection');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./Firebase.json'); // Replace with your Firebase service account key
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

/**
 * Send a push notification to a user
 * @param {string} userId - The ID of the user to notify
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 */
const sendPushNotification = async (userId, title, body) => {
    try {
        // Fetch the user's FCM token
        const user = await User.findByPk(userId);
        if (!user || !user.fcmToken) {
            console.warn('User or FCM token not found. Skipping push notification.');
            return;
        }

        // Send the notification
        const message = {
            notification: { title, body },
            token: user.fcmToken,
        };
        await admin.messaging().send(message);
        console.log('Push notification sent successfully');
    } catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
    }
};
module.exports = { sendPushNotification };