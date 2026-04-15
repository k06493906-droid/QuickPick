// Order Controller - Handle order operations
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send order confirmation email
const sendOrderConfirmationEmail = async (userEmail, userName, order) => {
  try {
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #333;">${item.name || 'Product'}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #666; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #333; text-align: right; font-weight: 600;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const deliveryDate = order.estimatedDelivery
      ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'Within 3-5 business days';

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `✅ Order Confirmed - #${order._id.toString().slice(-8).toUpperCase()} | QuickPick`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f5f3ff; padding: 30px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #6C5CE7; margin: 0; font-size: 24px;">⚡ QuickPick</h1>
          </div>
          
          <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
            <div style="background: linear-gradient(135deg, #6C5CE7, #5541d9); padding: 24px; text-align: center;">
              <div style="font-size: 40px; margin-bottom: 8px;">✅</div>
              <h2 style="color: white; margin: 0; font-size: 20px;">Order Confirmed!</h2>
              <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px;">Thank you for shopping with QuickPick</p>
            </div>

            <div style="padding: 24px;">
              <p style="color: #333; font-size: 15px;">Hi <strong>${userName || 'there'}</strong>,</p>
              <p style="color: #666; font-size: 14px; line-height: 1.6;">Your order has been placed successfully! Here's your receipt:</p>

              <div style="background: #f8f7ff; border-radius: 8px; padding: 14px 16px; margin: 16px 0;">
                <table style="width: 100%; font-size: 13px; color: #555;">
                  <tr><td style="padding: 4px 0;"><strong>Order ID:</strong></td><td style="text-align: right; font-weight: 700; color: #6C5CE7;">#${order._id.toString().slice(-8).toUpperCase()}</td></tr>
                  <tr><td style="padding: 4px 0;"><strong>Date:</strong></td><td style="text-align: right;">${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                  <tr><td style="padding: 4px 0;"><strong>Payment:</strong></td><td style="text-align: right;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</td></tr>
                  <tr><td style="padding: 4px 0;"><strong>Est. Delivery:</strong></td><td style="text-align: right;">${deliveryDate}</td></tr>
                </table>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <thead>
                  <tr style="background: #f5f3ff;">
                    <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #6C5CE7; text-transform: uppercase; letter-spacing: 1px;">Item</th>
                    <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #6C5CE7; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #6C5CE7; text-transform: uppercase; letter-spacing: 1px;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="border-top: 2px solid #6C5CE7; padding-top: 12px; margin-top: 8px; text-align: right;">
                <span style="font-size: 14px; color: #666;">Total Amount: </span>
                <span style="font-size: 22px; font-weight: 900; color: #6C5CE7;">₹${order.totalAmount.toFixed(2)}</span>
              </div>

              ${order.shippingAddress ? `
              <div style="background: #f0fdf4; border-radius: 8px; padding: 12px 16px; margin-top: 16px;">
                <p style="margin: 0; font-size: 12px; color: #065f46; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">📦 Shipping To</p>
                <p style="margin: 6px 0 0; font-size: 13px; color: #333; line-height: 1.5;">${order.shippingAddress}</p>
              </div>
              ` : ''}
            </div>

            <div style="background: #f8f7ff; padding: 16px 24px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 12px; color: #999;">Questions? Reply to this email or contact us at support@quickpick.com</p>
            </div>
          </div>

          <p style="text-align: center; font-size: 11px; color: #aaa; margin-top: 20px;">© ${new Date().getFullYear()} QuickPick. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', userEmail);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
};

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
      status: 'Placed',
      estimatedDelivery,
    });
    
    await order.save();

    // Send order confirmation email to the user
    try {
      const user = await User.findById(userId);
      if (user && user.email) {
        sendOrderConfirmationEmail(user.email, user.name, order);
      }
    } catch (emailErr) {
      console.error('Email lookup error:', emailErr);
    }
    
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['Placed', 'Shipped', 'Out for Delivery', 'Delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
    }
    
    const updateFields = { status };
    
    if (status === 'Delivered') {
      updateFields.paymentStatus = 'completed';
    }
    
    const order = await Order.findByIdAndUpdate(id, updateFields, { new: true });
    
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
    const order = await Order.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUserOrders, getOrderById, createOrder, updateOrderStatus, cancelOrder };
