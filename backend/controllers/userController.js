// User Controller - Handle user profile operations
const User = require('../models/User');

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, city, zipCode, photo, college, course, location, pincode } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        name, 
        phone, 
        address, 
        city, 
        zipCode, 
        photo, 
        college, 
        course, 
        location, 
        pincode,
        isProfileComplete: true 
      },
      { new: true }
    );
    
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, getAllUsers, deleteUser };
