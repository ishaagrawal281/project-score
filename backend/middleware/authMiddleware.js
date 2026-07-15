const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured in environment variables');
    }
    
    const decoded = jwt.verify(token, secret);
    
    // Decoded payload contains { id, email, name }
    req.user = decoded;
    next();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('JWT verification failed:', error.message);
    }
    return res.status(401).json({ error: 'Session expired or invalid authentication token.' });
  }
};

module.exports = authMiddleware;
