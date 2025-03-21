const path = require('path');

// Function to create a URL for media files
const createMediaUrl = (filePath) => {
  if (!filePath) return null;

  // Extract the filename from the path
  const filename = path.basename(filePath);

  // Determine the folder type (images, videos, audio, or misc)
  const match = filePath.match(/uploads\/(images|videos|audio|misc)/);
  const folderType = match ? match[1] : 'misc';

  // Get server URL and port from environment variables or use defaults
  const serverUrl = process.env.SERVER_URL || 'localhost';
  const port = process.env.PORT || '3304';

  // Construct and return the full URL
  return `http://${serverUrl}:${port}/uploads/${folderType}/${filename}`;
};

// Function to determine media type from MIME type
const getMediaType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
};

module.exports = {
  createMediaUrl,
  getMediaType
}; 