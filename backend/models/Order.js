// Order Model - MongoDB Schema using Mongoose
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Placed', 'Shipped', 'Out for Delivery', 'Delivered', 'cancelled'],
      default: 'Placed',
    },
    estimatedDelivery: {
      type: Date,
      default: null,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: 'card',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Export Order model
module.exports = mongoose.model('Order', orderSchema);
