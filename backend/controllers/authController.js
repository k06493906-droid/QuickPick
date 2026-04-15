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
    const { email, mode } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user = await User.findOne({ email });

    // If mode is 'login', only allow registered users
    if (mode === 'login' && !user) {
      return res.status(400).json({ error: 'No account found with this email. Please sign up first.' });
    }

    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    if (!user) {
      // Create a temporary user if they don't exist (signup flow)
      user = new User({ email, name: email.split('@')[0] });
    }

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your QuickPick Login OTP',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 30px; background: #f5f3ff; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #6C5CE7; margin: 0;">⚡ QuickPick</h1>
          </div>
          <div style="background: white; padding: 24px; border-radius: 10px; text-align: center;">
            <h2 style="color: #1a1a2e; margin-top: 0;">Your Verification Code</h2>
            <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #6C5CE7; padding: 16px; background: #f5f3ff; border-radius: 8px; margin: 16px 0;">${otp}</div>
            <p style="color: #666; font-size: 14px;">This code expires in <strong>5 minutes</strong>.</p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">If you didn't request this code, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully' });
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
    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '30d' }
    );

    res.json({ token, user });
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
      return res.status(400).json({ message: "User not found" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '30d' }
    );
    
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { signup, login, sendOTP, verifyOTP };
