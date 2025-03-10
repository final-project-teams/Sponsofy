const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'server/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// console.log("uploadDir  ",uploadDir);
// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create specific folders based on content type
    let folder = 'misc';
    if (file.mimetype.startsWith('image/')) {
      folder = 'images';
    } else if (file.mimetype.startsWith('video/')) {
      folder = 'videos';
    } else if (file.mimetype.startsWith('audio/')) {
      folder = 'audio';
    }
    
    const destinationPath = path.join(uploadDir, folder);
    fs.mkdirSync(destinationPath, { recursive: true });
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Define allowed mime types
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

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, audio, and PDFs are allowed.'), false);
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

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: true,
        message: 'File is too large. Maximum size is 10MB'
      });
    }
    return res.status(400).json({
      error: true,
      message: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      error: true,
      message: err.message
    });
  }
  
  next();
};

module.exports = {
  upload,
  handleUploadError
}; 