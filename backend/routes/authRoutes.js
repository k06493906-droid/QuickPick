// Authentication Routes
const express = require('express');
const { signup, login, sendOTP, verifyOTP } = require('../controllers/authController');

const router = express.Router();

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', login);

// Send OTP route
router.post('/send-otp', sendOTP);

// Verify OTP route
router.post('/verify-otp', verifyOTP);

module.exports = router;
