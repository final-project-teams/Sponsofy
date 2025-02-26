const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-super-secret-key-123';

const authMiddleware = (req, res, next) => {
  console.log('Headers:', req.headers);
  
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    console.log('No Authorization header');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    console.log('Token:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth Error:', err.message);
    return res.status(401).json({ error: 'Token is not valid', details: err.message });
  }
};

module.exports = authMiddleware; 