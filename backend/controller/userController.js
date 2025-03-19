const { User, ContentCreator, Company, Media } = require("../database/connection");
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

// Utility function to get file type from mimetype
const getMediaType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  return 'document';
};

// Utility function to create a proper URL for media files
const createMediaUrl = (filePath) => {
  if (!filePath) return null;
  const relativePath = filePath.replace(/^.*[\\\/]uploads[\\\/]/, '').replace(/\\/g, '/');
  return `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3034}/api/uploads/${relativePath}`;
};

module.exports = {
  // Login Controller
  Login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email/Username and password are required" });
      }

      const user = await User.findOne({
        where: { email: email },
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
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

  // Register Controller
  Register: async (req, res) => {
    try {
      const { username, email, password, role, first_name, last_name, industry, codeFiscal } = req.body;
      const file = req.file;

      if (!username || !email || !password || !role) {
        return res.status(400).json({
          error: true,
          message: "Username, email, password, and role are required",
        });
      }

      if (!['content_creator', 'company'].includes(role)) {
        return res.status(400).json({
          error: true,
          message: "Invalid role specified",
        });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({
          error: true,
          message: "Invalid email format",
        });
      }

      if (!validatePassword(password)) {
        return res.status(400).json({
          error: true,
          message: "Password must be at least 8 characters long, contain numbers, letters, and at least one uppercase letter",
        });
      }

      const existingUser = await User.findOne({
        where: { [Op.or]: [{ email }, { username }] },
      });

      if (existingUser) {
        return res.status(400).json({
          error: true,
          message: "Email or username already registered",
        });
      }

      const hashPassword = await bcrypt.hash(password, 10);

      const result = await sequelize.transaction(async (t) => {
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

        let profile;
        if (role === 'content_creator') {
          profile = await ContentCreator.create({
            userId: user.id,
            first_name: first_name,
            last_name: last_name,
            verified: false,
            isPremium: false,
          }, { transaction: t });
        } else if (role === 'company') {
          profile = await Company.create({
            userId: user.id,
            name: username,
            industry,
            codeFiscal,
            verified: false,
            isPremium: false,
          }, { transaction: t });
        }

        let mediaRecord = null;
        if (file) {
          const relativeFilePath = path.join('images', file.filename); // Store relative path
          mediaRecord = await Media.create({
            media_type: getMediaType(file.mimetype),
            file_url: relativeFilePath, // Store relative path
            file_name: file.filename,
            file_size: file.size,
            file_format: file.mimetype,
            description: `${role} profile picture`,
            ...(role === 'content_creator' ? { contentCreatorId: profile.id } : {}),
            ...(role === 'company' ? { companyId: profile.id } : {}),
          }, { transaction: t });

          await profile.update(
            { profile_picture: relativeFilePath, profilePictureId: mediaRecord.id },
            { transaction: t }
          );
        }

        return { user, profile, mediaRecord };
      });

      const accessToken = jwt.sign(
        { userId: result.user.id, role: result.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      const profileData = result.profile.toJSON();
      if (profileData.profile_picture) {
        profileData.profile_picture = createMediaUrl(profileData.profile_picture);
      }

      return res.status(201).json({
        error: false,
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          role: result.user.role,
          verified: result.user.verified,
          isPremium: result.user.isPremium,
          profile: profileData,
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

  // Get Current User Controller
  getCurrentUser: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findOne({
        where: { id: decoded.userId },
        attributes: { exclude: ['password_hash'] },
        include: [
          {
            model: decoded.role === 'content_creator' ? ContentCreator : Company,
            as: decoded.role === 'content_creator' ? 'contentCreator' : 'company',
            include: [
              { model: Media, as: 'ProfilePicture' },
            ],
          },
        ],
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userData = user.toJSON();
      if (userData.contentCreator?.profile_picture) {
        userData.contentCreator.profile_picture = createMediaUrl(userData.contentCreator.profile_picture);
      }
      if (userData.company?.profile_picture) {
        userData.company.profile_picture = createMediaUrl(userData.company.profile_picture);
      }

      res.json({
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          verified: userData.verified,
          isPremium: userData.isPremium,
          profile: decoded.role === 'content_creator' ? userData.contentCreator : userData.company,
        },
      });
    } catch (error) {
      console.error('Error fetching current user:', error);
      res.status(500).json({ message: 'Error fetching user data' });
    }
  },

  // Get User By ID Controller
  getUserById: async (req, res) => {
    try {
      const { userId } = req.params;

      const contentCreator = await ContentCreator.findOne({
        where: { userId },
        include: [
          { model: User, as: "user" },
          { model: Media, as: "ProfilePicture" },
        ],
      });

      if (!contentCreator) {
        return res.status(404).json({ message: "User not found" });
      }

      const userData = contentCreator.toJSON();
      if (userData.profile_picture) {
        userData.profile_picture = createMediaUrl(userData.profile_picture);
      }
      if (userData.ProfilePicture) {
        userData.ProfilePicture.file_url = createMediaUrl(userData.ProfilePicture.file_url);
      }

      res.status(200).json({
        message: "User data fetched successfully",
        user: userData,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ message: "Failed to fetch user data", error: error.message });
    }
  },

  // Update Content Creator Profile Controller
  updateContentCreatorProfile: async (req, res) => {
    try {
      const { userId } = req.params;
      const { first_name, last_name, bio, pricing, portfolio_links, location, category } = req.body;
      const file = req.file;

      const contentCreator = await ContentCreator.findOne({ where: { userId } });
      if (!contentCreator) {
        return res.status(404).json({ message: "Content creator not found" });
      }

      await contentCreator.update({
        first_name,
        last_name,
        bio,
        pricing,
        portfolio_links,
        location,
        category,
      });

      let mediaRecord = null;
      if (file) {
        const relativeFilePath = path.join('images', file.filename); // Store relative path
        mediaRecord = await Media.create({
          media_type: getMediaType(file.mimetype),
          file_url: relativeFilePath,
          file_name: file.filename,
          file_size: file.size,
          file_format: file.mimetype,
          description: 'Content creator profile picture',
          contentCreatorId: contentCreator.id,
        });

        await contentCreator.update({
          profile_picture: relativeFilePath,
          profilePictureId: mediaRecord.id,
        });
      }

      const updatedContentCreator = await ContentCreator.findOne({
        where: { userId },
        include: [{ model: Media, as: "ProfilePicture" }],
      });

      const creatorData = updatedContentCreator.toJSON();
      if (creatorData.profile_picture) {
        creatorData.profile_picture = createMediaUrl(creatorData.profile_picture);
      }
      if (creatorData.ProfilePicture) {
        creatorData.ProfilePicture.file_url = createMediaUrl(creatorData.ProfilePicture.file_url);
      }

      res.status(200).json({
        message: "Profile updated successfully",
        contentCreator: creatorData,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
  },

  // Update Social Media Controller
  updateSocialMedia: async (req, res) => {
    try {
      const { userId } = req.params;
      const { platform, audience, views, likes, followers } = req.body;

      const contentCreator = await ContentCreator.findOne({ where: { userId } });
      if (!contentCreator) {
        return res.status(404).json({ message: "Content creator not found" });
      }

      const [media, created] = await Media.findOrCreate({
        where: { contentCreatorId: contentCreator.id, platform },
        defaults: {
          media_type: 'document',
          file_url: '',
          file_name: platform,
          file_format: 'social',
          description: `${platform} statistics`,
          audience,
          views,
          likes,
          followers,
          contentCreatorId: contentCreator.id,
        },
      });

      if (!created) {
        await media.update({ audience, views, likes, followers });
      }

      res.status(200).json({
        message: "Social media data updated successfully",
        media,
      });
    } catch (error) {
      console.error("Error updating social media:", error);
      res.status(500).json({ message: "Failed to update social media", error: error.message });
    }
  },

  // Get Social Media Stats Controller
  getSocialMediaStats: async (req, res) => {
    try {
      const { userId } = req.params;

      const contentCreator = await ContentCreator.findOne({
        where: { userId },
        include: [{ model: Media, as: 'media', where: { platform: { [Op.not]: null } } }],
      });

      if (!contentCreator) {
        return res.status(404).json({ message: "Content creator not found" });
      }

      res.status(200).json({
        message: "Social media stats fetched successfully",
        stats: contentCreator.media,
      });
    } catch (error) {
      console.error("Error fetching social media stats:", error);
      res.status(500).json({ message: "Failed to fetch social media stats", error: error.message });
    }
  },

  // Update Profile Controller
  updateProfile: async (req, res) => {
    try {
      const { userId } = req.user;
      const { ...updateData } = req.body;
      const role = req.user.role;
      const file = req.file;

      if (req.user.userId !== parseInt(userId, 10)) {
        return res.status(403).json({ message: "You are not authorized to update this profile" });
      }

      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let profileModel;
      if (role === 'content_creator') {
        profileModel = ContentCreator;
      } else if (role === 'company') {
        profileModel = Company;
      } else {
        return res.status(400).json({ message: "Invalid role specified" });
      }

      const profile = await profileModel.findOne({ where: { userId } });
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      await profile.update(updateData);

      let mediaRecord = null;
      if (file) {
        const relativeFilePath = path.join('images', file.filename); // Store relative path
        mediaRecord = await Media.create({
          media_type: getMediaType(file.mimetype),
          file_url: relativeFilePath,
          file_name: file.filename,
          file_size: file.size,
          file_format: file.mimetype,
          description: `${role} profile picture`,
          ...(role === 'content_creator' ? { contentCreatorId: profile.id } : {}),
          ...(role === 'company' ? { companyId: profile.id } : {}),
        });

        await profile.update({
          profile_picture: relativeFilePath,
          profilePictureId: mediaRecord.id,
        });
      }

      const updatedProfile = await profileModel.findOne({
        where: { userId },
        include: [{ model: Media, as: 'ProfilePicture' }],
      });

      const profileData = updatedProfile.toJSON();
      if (profileData.profile_picture) {
        profileData.profile_picture = createMediaUrl(profileData.profile_picture);
      }
      if (profileData.ProfilePicture) {
        profileData.ProfilePicture.file_url = createMediaUrl(profileData.ProfilePicture.file_url);
      }

      res.status(200).json({
        message: "Profile updated successfully",
        profile: profileData,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
  },


  // updateProfile: async (req, res) => {
  //   try {
  //     const { userId } = req.user;
  //     const {  ...updateData } = req.body;
  //     const role = req.user.role;
  //     const file = req.file;

  //     // Ensure the authenticated user is updating their own profile
  //     if (req.user.userId !== parseInt(userId, 10)) {
  //       return res.status(403).json({ message: "You are not authorized to update this profile" });
  //     }

  //     // Find the user by ID
  //     const user = await User.findOne({ where: { id: userId } });
  //     if (!user) {
  //       return res.status(404).json({ message: "User not found" });
  //     }

  //     // Determine the profile model based on the role
  //     let profileModel;
  //     if (role === 'content_creator') {
  //       profileModel = ContentCreator;
  //     } else if (role === 'company') {
  //       profileModel = Company;
  //     } else {
  //       return res.status(400).json({ message: "Invalid role specified" });
  //     }

  //     // Find the profile by userId
  //     const profile = await profileModel.findOne({ where: { userId } });
  //     if (!profile) {
  //       return res.status(404).json({ message: "Profile not found" });
  //     }

  //     // Update the profile
  //     await profile.update(updateData);

  //     // Handle file upload and create media record
  //     let mediaRecord = null;
  //     if (file) {
  //       mediaRecord = await Media.create({
  //         media_type: getMediaType(file.mimetype),
  //         file_url: file.path,
  //         file_name: file.filename,
  //         file_size: file.size,
  //         file_format: file.mimetype,
  //         description: `${role} profile picture`,
  //         // Set the appropriate foreign key based on role
  //         ...(role === 'content_creator' ? { contentCreatorId: profile.id } : {}),
  //         ...(role === 'company' ? { CompanyId: profile.id } : {})
  //       });

  //       // Update profile with profile picture URL and association
  //       await profile.update({ 
  //         profile_picture: file.path,
  //         profilePictureId: mediaRecord.id // Set the association
  //       });
  //     }

  //     // Fetch the updated profile with media
  //     const updatedProfile = await profileModel.findOne({
  //       where: { userId },
  //       include: [
  //         {
  //           model: Media, as : role === 'content_creator' ? 'ProfilePicture' : undefined
  //         },

  //       ]
  //     });

  //     // Convert to plain object to modify
  //     const profileData = updatedProfile.toJSON();

  //     // Format media URLs
  //     if (profileData.profile_picture) {
  //       profileData.profile_picture = createMediaUrl(profileData.profile_picture);
  //     }

  //     if (profileData.ProfilePicture) {
  //       profileData.ProfilePicture.file_url = createMediaUrl(profileData.ProfilePicture.file_url);
  //     }

  //     if (profileData.ProfilePicture && profileData.ProfilePicture.length > 0) {
  //       profileData.ProfilePicture = profileData.ProfilePicture.map(item => ({
  //         ...item,
  //         file_url: createMediaUrl(item.file_url)
  //       }));
  //     }

  //     // Return the updated profile data
  //     res.status(200).json({
  //       message: "Profile updated successfully",
  //       profile: profileData,
  //     });
  //   } catch (error) {
  //     console.error("Error updating profile:", error);
  //     res.status(500).json({ message: "Failed to update profile", error: error.message });
  //   }
  // },

};
