const http = require('http');
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const verifyEndpoint = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const product = await Product.findOne();
    if (!product) {
      console.log('No products found to test');
      process.exit(1);
    }
    
    const productId = product._id.toString();
    console.log(`Testing hybrid recommendations for product: ${product.name} (${productId})`);

    const { getSimilarProducts } = require('./utils/recommendation');
    const allProducts = await Product.find().lean();
    const similar = getSimilarProducts(productId, allProducts, 5);
    console.log('Manual check - Similar Products count:', similar.length);
    console.log('Top Similar:', similar.map(p => p.name).join(', '));
    
    const { getFrequentlyBoughtTogether } = require('./utils/apriori');
    const Order = require('./models/Order');
    const allOrders = await Order.find().lean();
    const frequent = getFrequentlyBoughtTogether(productId, allOrders, 1); // Use threshold 1 for testing
    console.log('Manual check - Frequently Bought Together IDs count:', frequent.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Verification error:', error);
    process.exit(1);
  }
};

verifyEndpoint();
