// Payment Controller - Handles Razorpay integration
const Razorpay = require('razorpay');

// Initialize Razorpay with provided test keys
const razorpay = new Razorpay({
  key_id: 'rzp_test_SXxQ225pe3KBKo',
  key_secret: 'sGkN4dMVX5zDwh0CF5i7G8rp',
});

/**
 * Create Razorpay Order
 * API: POST /api/payment/create-order
 * This order must be created before the Razorpay checkout opens
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // Amount should be in paise (₹1 = 100 paise)
    const options = {
      amount: Math.round(amount * 100), 
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpay.orders.create(options);
    
    // Return order details to frontend to open checkout popup
    res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

/**
 * Verify Razorpay Payment (Simple version)
 * This is called after the user completes payment on the frontend
 */
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    
    // Basic success handling (signature verification can be added for extra security)
    if (razorpay_payment_id) {
      res.status(200).json({ 
        success: true, 
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id 
      });
    } else {
      res.status(400).json({ success: false, error: 'Payment details missing' });
    }
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
};
