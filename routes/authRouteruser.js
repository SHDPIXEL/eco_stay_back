const express = require('express');
const { sendOtp, verifyOtp,getuserdetails,loginOrRegisterUser,order,orderSuccess } = require('../controllers/authControlleruser');
const { validateRequestBody, verifyToken, otpRateLimiter } = require('../middleware/usermiddleware');

const router = express.Router();

// Routes for phone number and OTP-based login
router.post('/send-otp', [otpRateLimiter, validateRequestBody(['phoneNumber'])], sendOtp);
router.post('/verify-otp', validateRequestBody(['phoneNumber', 'otp']), verifyOtp);
router.post('/user-data',getuserdetails);
router.post('/booking_register',loginOrRegisterUser)
router.post('/booking/orders',order)
router.post('/booking/success',orderSuccess)

// Example of a protected route
router.get('/protected-route', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Access granted', user: req.user });
});

module.exports = router;
