const { User, ContentCreator, Company } = require("../database/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

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
      const { email, username, password } = req.body;

      // Check if either email or username is provided
      if ((!email && !username) || !password) {
        return res
          .status(400)
          .json({ message: "Email/Username and password are required" });
      }

      // Find user by email or username
      const user = await User.findOne({
        where: {
          [Op.or]: [{ email: email || null }, { username: username || null }],
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
      const { username, email, password, role } = req.body;

      // Check for required fields
      if (!username || !email || !password) {
        return res.status(400).json({
          error: true,
          message: "Username, email, and password are required",
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
          message:
            "Password must be at least 8 characters long, contain numbers, letters, and at least one uppercase letter",
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

      const user = await User.create({
        username,
        email: email.toLowerCase(),
        password_hash: hashPassword,
        role: role || "content_creator", // Default to 'content_creator' if role is not provided
        verified: false, // Default to false
        isPremium: false, // Default to false
      });

      // If the user is a content creator, create a corresponding ContentCreator record
      if (user.role === "content_creator") {
        await ContentCreator.create({
          first_name: username,
          userId: user.id,
          verified: user.verified,
          isPremium: user.isPremium,
        });
      } else if (user.role === "company") {
        await Company.create({
          name: username,
          userId: user.id,
          verified: user.verified,
          isPremium: user.isPremium,
        });
      }

      // Generate JWT token
      const accessToken = jwt.sign(
        {
          userId: user.id,
          role: user.role,
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
          isPremium: user.isPremium,
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
