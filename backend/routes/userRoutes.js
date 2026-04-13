// User Routes
const express = require('express');
const { getUserProfile, updateUserProfile, getAllUsers, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes - require authentication
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.delete('/profile', authMiddleware, deleteUser);

// Get all users (Admin only - middleware should check for admin)
router.get('/', authMiddleware, getAllUsers);

module.exports = router;
