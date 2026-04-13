// Cart Controller - Handle shopping cart operations
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get Cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Item to Cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    
    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, price: product.price });
    }
    
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    
    await cart.save();
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove Item from Cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    
    await cart.save();
    res.status(200).json({ message: 'Item removed from cart', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Clear Cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: [], totalPrice: 0 },
      { new: true }
    );
    
    res.status(200).json({ message: 'Cart cleared', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };
