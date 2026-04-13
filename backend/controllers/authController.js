// Authentication Controller - Handle login, signup, and token generation
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Email
const sendOTP = async (req, res) => {
  console.log("Send OTP request:", req.body);
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    let user = await User.findOne({ email });
    if (!user) {
      // Create a temporary user if they don't exist
      user = new User({ email, name: email.split('@')[0] });
    }

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save(); // FIX 4: Ensure OTP and expiry are saved

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your QuickPick Login OTP',
      text: `Your OTP for QuickPick login is: ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully to your email' });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  console.log("Verify OTP request:", req.body);
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    
    // FIX 5: Verify OTP and expiry logic
    if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Signup User
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login User
const login = async (req, res) => {
  console.log("Login request:", req.body);
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    
    // FIX 3: Robust password check with bcrypt
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '30d' }
    );
    
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isProfileComplete: user.isProfileComplete,
    };
    
    res.status(200).json({ message: 'Login successful', token, user: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { signup, login, sendOTP, verifyOTP };
