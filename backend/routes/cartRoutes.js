// Cart Routes
const express = require('express');
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes - require authentication
router.get('/', authMiddleware, getCart);
router.post('/add', authMiddleware, addToCart);
router.post('/remove', authMiddleware, removeFromCart);
router.delete('/clear', authMiddleware, clearCart);

module.exports = router;
