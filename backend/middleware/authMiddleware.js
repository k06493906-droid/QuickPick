// Authentication Middleware - JWT Token Verification
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    console.log('Auth Header:', req.headers.authorization);
    console.log('Token:', token);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    console.log('JWT Error:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
