const jwt = require('jsonwebtoken');
const { User } = require('../database/connection');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }
    
    try {
      // Verify token using the same secret as in your login/signup routes
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key-123');
      
      // Find user by id
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Attach user to request object
      req.user = user;
      
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        // If token is expired, try to refresh it
        try {
          // Decode the token without verification to get the user ID
          const decoded = jwt.decode(token);
          if (!decoded || !decoded.id) {
            return res.status(401).json({ message: 'Invalid token format' });
          }
          
          // Find the user
          const user = await User.findByPk(decoded.id);
          if (!user) {
            return res.status(401).json({ message: 'User not found' });
          }
          
          // Generate a new token
          const newToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-super-secret-key-123',
            { expiresIn: '7d' } // Set a longer expiration time
          );
          
          // Attach the user to the request
          req.user = user;
          
          // Send the new token in the response headers
          res.setHeader('X-New-Token', newToken);
          
          next();
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          return res.status(401).json({ 
            message: 'Token expired and could not be refreshed',
            needsLogin: true
          });
        }
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      } else {
        console.error('JWT verification error:', jwtError);
        return res.status(401).json({ message: 'Authentication error' });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

module.exports = authMiddleware; 