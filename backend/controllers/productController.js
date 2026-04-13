// Product Controller - Handle product operations
const Product = require('../models/Product');
const Order = require('../models/Order');

const { getSimilarProducts } = require('../utils/recommendation');
const { getFrequentlyBoughtTogether } = require('../utils/apriori');

const MAX_RECOMMENDATIONS = 4;
const MIN_RECOMMENDATIONS = 3;

const categoryRelations = {
  laptops: ['mouse', 'keyboards', 'gadgets'],
  keyboards: ['laptops', 'mouse', 'gadgets'],
  mouse: ['keyboards', 'gadgets', 'accessories'],
  gadgets: ['accessories', 'student-accessories', 'daily-essentials'],
  bags: ['daily-essentials', 'student-accessories', 'gadgets'],
  books: ['stationery', 'daily-essentials', 'accessories'],
  stationery: ['accessories', 'student-accessories', 'books'],
  accessories: ['gadgets', 'daily-essentials', 'student-accessories'],
  'student-accessories': ['stationery', 'gadgets', 'daily-essentials'],
  'daily-essentials': ['gadgets', 'accessories', 'bags'],
};

const normalizeCategory = (value = '') => value.toLowerCase();

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildCategoryRegexList = (categories) =>
  categories.filter(Boolean).map((category) => new RegExp(`^${escapeRegex(category)}$`, 'i'));

const pickRandomSubset = (products, count) => {
  if (!products.length) {
    return [];
  }

  const pool = [...products];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, Math.min(count, pool.length));
};

const getRelatedCategories = (categories) => {
  const related = new Set();
  categories.forEach((category) => {
    const normalized = normalizeCategory(category);
    const matches = categoryRelations[normalized] || [];
    matches.forEach((item) => related.add(item));
  });
  return Array.from(related);
};

// Get All Products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create Product (Admin only) - handles single product or array of products
const createProduct = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      const products = await Product.insertMany(req.body);
      res.status(201).json({ message: `${products.length} products created successfully`, products });
    } else {
      const { name, description, price, category, stock, image } = req.body;
      let imageUrl = image;
      
      if (req.file) {
        imageUrl = `http://localhost:5000/${req.file.filename}`;
      }
      
      const product = new Product({
        name,
        description,
        price,
        category,
        stock,
        image: imageUrl,
      });
      
      await product.save();
      res.status(201).json({ message: 'Product created successfully', product });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, image } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      id,
      { name, description, price, category, stock, image },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete all products (Admin only)
const deleteAllProducts = async (req, res) => {
  try {
    const result = await Product.deleteMany({});
    res.status(200).json({ message: `Deleted ${result.deletedCount} products`, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get AI Recommendations based on order history
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    const latestOrder = await Order.findOne({ userId })
      .sort({ createdAt: -1 })
      .populate('items.productId');

    if (!latestOrder) {
      const products = await Product.find().lean();
      const desiredCount = Math.min(
        MAX_RECOMMENDATIONS,
        Math.max(MIN_RECOMMENDATIONS, products.length)
      );
      return res.status(200).json(pickRandomSubset(products, desiredCount));
    }

    const purchasedProductIds = new Set();
    const recentCategories = new Set();

    latestOrder.items.forEach((item) => {
      if (!item.productId) {
        return;
      }
      purchasedProductIds.add(item.productId._id.toString());
      const category = normalizeCategory(item.productId.category);
      if (category) {
        recentCategories.add(category);
      }
    });

    const relatedCategories = getRelatedCategories(Array.from(recentCategories));
    const prioritizedCategories = relatedCategories.length
      ? relatedCategories
      : Array.from(recentCategories);

    let recommendations = [];

    if (prioritizedCategories.length) {
      const candidateProducts = await Product.find({
        category: { $in: buildCategoryRegexList(prioritizedCategories) },
        _id: { $nin: Array.from(purchasedProductIds) },
      }).lean();
      recommendations = pickRandomSubset(candidateProducts, MAX_RECOMMENDATIONS);
    }

    if (recommendations.length < MIN_RECOMMENDATIONS) {
      const excludedIds = new Set([
        ...purchasedProductIds,
        ...recommendations.map((product) => product._id.toString()),
      ]);
      const fallbackProducts = await Product.find({
        _id: { $nin: Array.from(excludedIds) },
      }).lean();
      const fallbackNeeded = MAX_RECOMMENDATIONS - recommendations.length;
      recommendations = recommendations.concat(
        pickRandomSubset(fallbackProducts, fallbackNeeded)
      );
    }

    const uniqueRecommendations = [];
    const seen = new Set();

    recommendations.forEach((product) => {
      if (!product) {
        return;
      }
      const id = product._id.toString();
      if (seen.has(id)) {
        return;
      }
      if (uniqueRecommendations.length >= MAX_RECOMMENDATIONS) {
        return;
      }
      seen.add(id);
      uniqueRecommendations.push(product);
    });

    const desiredCount = Math.min(
      MAX_RECOMMENDATIONS,
      Math.max(MIN_RECOMMENDATIONS, uniqueRecommendations.length)
    );

    res.status(200).json(uniqueRecommendations.slice(0, desiredCount));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Smart Search API - Auto Suggestion Logic
 * Performs case-insensitive partial matching across name, description, category, and tags
 */
const getProductSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(200).json([]);
    }

    const searchRegex = new RegExp(escapeRegex(q), 'i');

    // Search in name, description, category, and tags
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { tags: { $in: [searchRegex] } },
      ],
    })
      .limit(5)
      .select('name image _id price category'); // Return only necessary fields for performance

    res.status(200).json(products);
  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({ error: 'Failed to fetch search suggestions' });
  }
};

/**
 * Get Hybrid Recommendations for a specific product
 * Combines Content-Based Filtering and Association Rule Mining (Apriori)
 */
const getHybridRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Fetch the target product
    const targetProduct = await Product.findById(id);
    if (!targetProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 2. Fetch all products and orders for analysis
    const allProducts = await Product.find().lean();
    const allOrders = await Order.find().lean();

    // 3. Content-Based Recommendations (Similar Products)
    // Uses TF-IDF and Cosine Similarity
    const similarProducts = getSimilarProducts(id, allProducts, 5);

    // 4. Association Rule Mining (Frequently Bought Together)
    // Uses Apriori-like logic with a configurable threshold
    const threshold = req.query.threshold ? parseInt(req.query.threshold) : 2;
    const frequentlyBoughtIds = getFrequentlyBoughtTogether(id, allOrders, threshold);

    // Fetch full product details for frequently bought together items
    const frequentlyBoughtTogether = await Product.find({
      _id: { $in: frequentlyBoughtIds }
    }).lean();

    res.status(200).json({
      similarProducts,
      frequentlyBoughtTogether
    });
  } catch (error) {
    console.error('Hybrid Recommendation Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  deleteAllProducts, 
  getRecommendations,
  getHybridRecommendations,
  getProductSearch
};
