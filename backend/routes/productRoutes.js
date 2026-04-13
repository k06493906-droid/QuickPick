// Product Routes
const express = require('express');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, deleteAllProducts, getRecommendations, getHybridRecommendations, getProductSearch } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Hybrid Recommendation API
router.get('/hybrid/:id', getHybridRecommendations);

// Search and suggestions API
router.get('/search', getProductSearch);

// Protected routes - require authentication (must come before /:id)
router.get('/recommendations/ai', authMiddleware, getRecommendations);

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes - require authentication (Admin only)
router.post('/', authMiddleware, upload.single('image'), createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/', authMiddleware, deleteAllProducts);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;
