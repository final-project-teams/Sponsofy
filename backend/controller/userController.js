 const { User, ContentCreator, Company,Media } = require("../database/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { sequelize } = require("../database/connection");

const path = require("path");
const fs = require("fs");

// Utility function to validate password
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Utility function to validate email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
  return emailRegex.test(email);
};

module.exports = {
  Login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if either email or username is provided
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email/Username and password are required" });
      }

      // Find user by email or username
      const user = await User.findOne({
        where: {
         email: email 
        
        },
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare password with password_hash
      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const accessToken = jwt.sign(
        {
          userId: user.id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

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
      res.status(500).json({ message: "Error logging in" });
    }
  },

  Register: async (req, res) => {
    try {
      const { username, email, password, role, first_name, last_name, industry, codeFiscal } = req.body;

      // Check for required fields
      if (!username || !email || !password || !role) {
        return res.status(400).json({
          error: true,
          message: "Username, email, password and role are required",
        });
      }

      // Validate role
      if (!['content_creator', 'company'].includes(role)) {
        return res.status(400).json({
          error: true,
          message: "Invalid role specified",
        });
      }

      // Validate email format
      if (!validateEmail(email)) {
        return res.status(400).json({
          error: true,
          message: "Invalid email format",
        });
      }

      // Validate password
      if (!validatePassword(password)) {
        return res.status(400).json({
          error: true,
          message: "Password must be at least 8 characters long, contain numbers, letters, and at least one uppercase letter",
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email }, { username }],
        },
      });

      if (existingUser) {
        return res.status(400).json({
          error: true,
          message: "Email or username already registered",
        });
      }

      // Hash password
      const hashPassword = await bcrypt.hash(password, 10);

      // Create user with transaction to ensure data consistency
      const result = await sequelize.transaction(async (t) => {
        // Create the user first
        const user = await User.create({
          username,
          first_name,
          last_name,
          email: email.toLowerCase(),
          password_hash: hashPassword,
          role,
          verified: false,
          isPremium: false,
        }, { transaction: t });

        // Based on role, create either ContentCreator or Company
        if (role === 'content_creator') {
          await ContentCreator.create({
            userId: user.id,
            first_name: first_name,
            last_name: last_name,
            verified: false,
            isPremium: false,
          }, { transaction: t });
        } else if (role === 'company') {
          await Company.create({
            userId: user.id,
            name: username,
            industry,
            codeFiscal,
            verified: false,
            isPremium: false,
          }, { transaction: t });
        }

        return user;
      });

      // Generate JWT token
      const accessToken = jwt.sign(
        {
          userId: result.id,
          role: result.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // After successful registration, fetch the complete user data
      const completeUser = await User.findOne({
        where: { id: result.id },
        attributes: { exclude: ['password_hash'] },
        include: [
          {
            model: role === 'content_creator' ? ContentCreator : Company,
            as: role === 'content_creator' ? 'contentCreator' : 'company'
          }
        ]
      });

      return res.status(201).json({
        error: false,
        user: {
          id: completeUser.id,
          username: completeUser.username,
          email: completeUser.email,
          role: completeUser.role,
          verified: completeUser.verified,
          isPremium: completeUser.isPremium,
          profile: role === 'content_creator' ? completeUser.contentCreator : completeUser.company
        },
        accessToken,
      });

    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({
        error: true,
        message: "Error during registration",
      });
    }
  },



  getCurrentUser: async (req, res) => {
    try {
      
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user with associated data based on role
      const user = await User.findOne({
        where: { id: decoded.userId },
        attributes: { exclude: ['password_hash'] },
        include: [
          {
            model: decoded.role === 'content_creator' ? ContentCreator : Company,
            as: decoded.role === 'content_creator' ? 'contentCreator' : 'company',
            include: [{
              model: Media,
              as: decoded.role === 'content_creator' ? 'Portfolio' : undefined
            }]
          }
        ]
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          verified: user.verified,
          isPremium: user.isPremium,
          profile: decoded.role === 'content_creator' ? user.contentCreator : user.company
        }
      });

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token expired' });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      console.error('Error fetching current user:', error);
      res.status(500).json({ message: 'Error fetching user data' });
    }
  },

  uploadProfilePicture: async (req, res) => {
    try {
      const userId = req.body.userId; // Get userId from the request body
      const filePath = req.file.path; // Full path to the uploaded file

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Find the content creator in the database
      const contentCreator = await ContentCreator.findOne({
        where: { userId },
      });
      if (!contentCreator) {
        return res.status(404).json({ message: "Content creator not found" });
      }

      // Delete the old profile picture if it exists
      if (contentCreator.profile_picture) {
        const oldFilePath = path.join(
          __dirname,
          "..",
          contentCreator.profile_picture
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath); // Delete the old file
        }
      }

      // Store only the relative path in the database
      const relativeFilePath = path.relative(
        path.join(__dirname, ".."),
        filePath
      );
      contentCreator.profile_picture = relativeFilePath; // Store relative path
      await contentCreator.save();

      // Send the updated content creator data in the response
      res.status(200).json({
        message: "Profile picture uploaded successfully",
        profilePicture: `/uploads/${relativeFilePath}`, // Return the URL to access the file
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({
        message: "Failed to upload profile picture",
        error: error.message,
      });
    }
  },


  

  getUserById: async (req, res) => {
    try {
      const { userId } = req.params; // Get userId from URL params

      // Find the user by ID in the ContentCreator table
      const user = await ContentCreator.findOne({
        where: { userId }, // Match userId in ContentCreator table
        include: [
          {
            model: User,
            as: "user", // Use the alias defined in your association
          },
        ],
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return the user data
      res.status(200).json({
        message: "User data fetched successfully",
        user,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch user data", error: error.message });
    }
  },

  updateContentCreatorProfile: async (req, res) => {
    try {
      const { userId } = req.params; // Get userId from URL params
      const {
        first_name,
        last_name,
        bio,
        pricing,
        portfolio_links,
        location,
        category,
      } = req.body;

      // Find the content creator by userId
      const contentCreator = await ContentCreator.findOne({
        where: { userId },
      });
      if (!contentCreator) {
        return res.status(404).json({ message: "Content creator not found" });
      }

      // Update the content creator's profile
      await contentCreator.update({
        first_name,
        last_name,
        bio,
        pricing,
        portfolio_links,
        location,
        category,
      });

      // Return the updated content creator data
      res.status(200).json({
        message: "Profile updated successfully",
        contentCreator,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res
        .status(500)
        .json({ message: "Failed to update profile", error: error.message });
    }
  },

 
};
