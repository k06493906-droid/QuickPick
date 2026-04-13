// Product Model - MongoDB Schema using Mongoose
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Export Product model
module.exports = mongoose.model('Product', productSchema);
