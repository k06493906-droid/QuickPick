const mongoose = require('mongoose');
const Product = require('./models/Product');
const Order = require('./models/Order');
const User = require('./models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickpick');
    console.log('Connected to MongoDB');

    // Update existing products with some tags
    const products = await Product.find();
    console.log(`Found ${products.length} products to update`);

    for (const product of products) {
      const tags = product.name.split(' ').concat(product.category.split('-'));
      product.tags = [...new Set(tags.map(t => t.toLowerCase()))];
      await product.save();
    }
    console.log('Updated products with tags');

    // Create a dummy user for orders if none exists
    let user = await User.findOne();
    if (!user) {
      user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();
      console.log('Created dummy user');
    }

    // Create some sample orders for Apriori logic
    const orderCount = await Order.countDocuments();
    if (orderCount === 0 && products.length >= 3) {
      const order1 = new Order({
        userId: user._id,
        items: [
          { productId: products[0]._id, quantity: 1, price: products[0].price },
          { productId: products[1]._id, quantity: 1, price: products[1].price }
        ],
        totalAmount: products[0].price + products[1].price,
        shippingAddress: '123 Test St'
      });
      
      const order2 = new Order({
        userId: user._id,
        items: [
          { productId: products[0]._id, quantity: 1, price: products[0].price },
          { productId: products[1]._id, quantity: 1, price: products[1].price },
          { productId: products[2]._id, quantity: 1, price: products[2].price }
        ],
        totalAmount: products[0].price + products[1].price + products[2].price,
        shippingAddress: '123 Test St'
      });

      await order1.save();
      await order2.save();
      console.log('Created sample orders');
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
