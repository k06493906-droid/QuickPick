// Order Routes
const express = require('express');
const { getUserOrders, getOrderById, createOrder, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes - require authentication
router.get('/', authMiddleware, getUserOrders);
router.get('/:id', authMiddleware, getOrderById);
router.post('/', authMiddleware, createOrder);
router.put('/:id', authMiddleware, updateOrderStatus);
router.put('/:id/status', authMiddleware, updateOrderStatus); // New status tracking API
router.delete('/:id', authMiddleware, cancelOrder);

module.exports = router;
