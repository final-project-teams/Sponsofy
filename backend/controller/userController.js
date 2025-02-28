const { User, ContentCreator, Company } = require('../database/connection');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require('sequelize');


// Utility function to validate password
const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};

module.exports = {
    Login: async (req, res) => {
        try {
            const { email, username, password } = req.body;

            // Check if either email or username is provided
            if ((!email && !username) || !password) {
                return res.status(400).json({ message: "Email/Username and password are required" });
            }

            // Find user by email or username
            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        { email: email || null },
                        { username: username || null }
                    ]
                }
            });

            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            // Compare password with password_hash
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const accessToken = jwt.sign(
                { 
                    userId: user.id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                token: accessToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    verified: user.verified,
                    isPremium: user.isPremium
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error logging in" });
        }
    },

    Register: async (req, res) => {
        try {
            const { 
                username, 
                email, 
                password, 
                role
            } = req.body;

            // Check for required fields
            if (!username || !email || !password) {
                return res.status(400).json({ 
                    error: true, 
                    message: "Username, email, and password are required" 
                });
            }

            // Validate password
            if (!validatePassword(password)) {
                return res.status(400).json({ 
                    error: true, 
                    message: "Password must be at least 8 characters long, contain numbers, letters, and at least one uppercase letter" 
                });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ 
                where: { 
                    [Op.or]: [
                        { email },
                        { username }
                    ]
                } 
            });
            if (existingUser) {
                return res.status(400).json({ 
                    error: true, 
                    message: "Email or username already registered" 
                });
            }

            // Hash password
            const hashPassword = await bcrypt.hash(password, 10);

            const user = await User.create({
                username,
                email: email.toLowerCase(),
                password_hash: hashPassword,
                role: role || 'content_creator', // Default to 'content_creator' if role is not provided
                verified: false, // Default to false
                isPremium: false // Default to false
            });

            // If the user is a content creator, create a corresponding ContentCreator record
            if (user.role === 'content_creator') {
                await ContentCreator.create({
                    first_name: username,
                    userId: user.id,
                    verified: user.verified,
                    isPremium: user.isPremium
                });
            } 
            else if (user.role === 'company') {
                await Company.create({
                    name: username,
                    userId: user.id,
                    verified: user.verified,
                    isPremium: user.isPremium
                });
            } 

            // Generate JWT token
            const accessToken = jwt.sign(
                { 
                    userId: user.id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: "24h" } // Standardized to 24h
            );

            return res.status(201).json({
                error: false,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    verified: user.verified,
                    isPremium: user.isPremium
                },
                accessToken
            });

        } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({ 
                error: true, 
                message: "Error during registration" 
            });
        }
    }
};