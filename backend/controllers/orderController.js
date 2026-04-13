// Order Controller - Handle order operations
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Get All Orders for User
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId }).populate('items.productId');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create Order
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, shippingAddress, paymentMethod, paymentId } = req.body;
    
    console.log('Order Request Body:', req.body);
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Set Estimated Delivery Date: Current Date + 3 Days
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
    
    const order = new Order({
      userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentId: paymentId || null,
      paymentStatus: paymentId ? 'completed' : 'pending',
      // Status flow: Placed -> Shipped -> Out for Delivery -> Delivered
      status: paymentId ? 'Placed' : 'Placed', 
      estimatedDelivery,
    });
    
    await order.save();
    
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Order Status - Manual tracking update
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Allowed statuses for tracking
    const validStatuses = ['Placed', 'Shipped', 'Out for Delivery', 'Delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
    }
    
    const updateFields = { status };
    
    // If status is Delivered, we could update paymentStatus as well if not already
    if (status === 'Delivered') {
      updateFields.paymentStatus = 'completed';
    }
    
    const order = await Order.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel Order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUserOrders, getOrderById, createOrder, updateOrderStatus, cancelOrder };
