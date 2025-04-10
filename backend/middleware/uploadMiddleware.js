const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create base uploads directory with proper error handling
const uploadDir = path.join(__dirname, '..', 'uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // Create subdirectories for different media types
  const subDirs = ['images', 'videos', 'audio', 'misc'];
  subDirs.forEach(dir => {
    const subPath = path.join(uploadDir, dir);
    if (!fs.existsSync(subPath)) {
      fs.mkdirSync(subPath, { recursive: true });
    }
  });
} catch (err) {
  console.error('Error creating upload directories:', err);
}

// Configure storage with better error handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      let folder = 'misc';
      if (file.mimetype.startsWith('image/')) {
        folder = 'images';
      } else if (file.mimetype.startsWith('video/')) {
        folder = 'videos';
      } else if (file.mimetype.startsWith('audio/')) {
        folder = 'audio';
      }
      
      const destinationPath = path.join(uploadDir, folder);
      // Ensure directory exists before proceeding
      if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
      }
      cb(null, destinationPath);
    } catch (err) {
      cb(new Error('Failed to process upload directory: ' + err.message));
    }
  },
  filename: function (req, file, cb) {
    try {
      // Create unique filename with timestamp and original extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname) || '.unknown';
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    } catch (err) {
      cb(new Error('Failed to generate filename: ' + err.message));
    }
  }
});

// File filter with improved MIME type checking
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/mpeg',
    'audio/mpeg',
    'audio/mp3',
    'application/pdf'
  ];

  if (!file.mimetype) {
    cb(new Error('No MIME type detected for the file'), false);
    return;
  }

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only images, videos, audio, and PDFs are allowed.`), false);
  }
};

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Create middleware for handling single image upload
const uploadSingle = upload.single('image');

// Enhanced error handling middleware
const handleUploadError = (err, req, res, next) => {
  console.error('Upload error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: true,
        message: 'File is too large. Maximum size is 10MB'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: true,
        message: 'Wrong field name. Please use "image" as the field name.'
      });
    }
    return res.status(400).json({
      error: true,
      message: `Upload error: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      error: true,
      message: err.message || 'An error occurred during file upload'
    });
  }
  
  next();
};

module.exports = {
  upload,
  uploadSingle,
  handleUploadError,
  uploadDir // Export uploadDir for use in other modules
}; 