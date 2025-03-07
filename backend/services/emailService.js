const nodemailer = require('nodemailer');

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail', // Replace with your email service
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your email password
    },
});

/**
 * Send an email notification
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body
 */
const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = { sendEmail };