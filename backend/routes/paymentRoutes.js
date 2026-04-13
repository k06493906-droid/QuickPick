const express = require('express');
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a new Razorpay order
// Amount is required in the body
router.post('/create-order', authMiddleware, createRazorpayOrder);

// Route to verify the payment after success on the frontend
router.post('/verify-payment', authMiddleware, verifyPayment);

module.exports = router;
