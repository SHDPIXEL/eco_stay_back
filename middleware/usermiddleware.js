const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const User = require('../models/user')

// Validate Request Body
function validateRequestBody(requiredFields) {
    return (req, res, next) => {
        const missingFields = requiredFields.filter((field) => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing fields: ${missingFields.join(', ')}` });
        }
        next();
    };
}

// Rate Limiter for OTP Requests
const otpRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // Limit each IP to 5 OTP requests per window
    message: 'Too many OTP requests from this IP, please try again later.',
});

// Verify JWT Token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        req.user = decoded;
        next();
    });
}

// Authenticate User
const authenticateUser = async (req, res, next) => {
    // Get the token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer', '').trim();
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
  
    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Find the user using the ID from the decoded token
      const user = await User.findOne({ where: { id: decoded.userId } });
  
      // If the user does not exist, deny access
      if (!user) {
        return res.status(403).json({ error: 'Access Denied. Invalid user.' });
      }
  
      // Attach the user to the request object for later use
      req.user = user;
      req.isAgent = false;
  
      // Proceed to the next middleware or route handler
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid Token.', details: err.message });
    }
  };

module.exports = {
    validateRequestBody,
    otpRateLimiter,
    verifyToken,
    authenticateUser
};
