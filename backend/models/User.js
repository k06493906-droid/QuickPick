// User Model - MongoDB Schema using Mongoose
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    photo: {
      type: String,
      default: null,
    },
    college: {
      type: String,
      default: null,
    },
    course: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    pincode: {
      type: String,
      default: null,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    zipCode: {
      type: String,
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Export User model
module.exports = mongoose.model('User', userSchema);
