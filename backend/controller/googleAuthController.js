const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const { User, ContentCreator, Company } = require('../database/connection');


module.exports = {
    GoogleAuth: async (req, res) => {
        try {
            const { token } = req.body;

            // Verify the Google ID token
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            const { email, name, picture } = payload;

            // Check if the user already exists
            let user = await User.findOne({ where: { email } });

            if (!user) {
                // Create a new user if they don't exist
                user = await User.create({
                    username: name,
                    email,
                    password_hash: '', // No password for Google auth
                    role: 'content_creator', // Default role
                    verified: true,
                    isPremium: false,
                });

                // Create corresponding ContentCreator or Company record
                if (user.role === 'content_creator') {
                    await ContentCreator.create({
                        first_name: name,
                        userId: user.id,
                        verified: true,
                        isPremium: false,
                    });
                } else if (user.role === 'company') {
                    await Company.create({
                        name: name,
                        userId: user.id,
                        verified: true,
                        isPremium: false,
                    });
                }
            }

            // Generate a JWT token for the user
            const accessToken = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Return the token and user data
            res.json({
                token: accessToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    verified: user.verified,
                    isPremium: user.isPremium,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error during Google authentication" });
        }
    },
};