const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

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

module.exports = {
    validateRequestBody,
    otpRateLimiter,
    verifyToken,
};
