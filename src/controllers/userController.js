// src/controllers/userController.js
const User = require('../models/User');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ status: 'unsuccessful', message: 'Error fetching users' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: 'unsuccessful', message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ status: 'unsuccessful', message: 'Error fetching user' });
  }
};

// Update user by ID
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ status: 'unsuccessful', message: 'User not found' });
    }
    res.status(200).json({ status: 'success', message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ status: 'unsuccessful', message: 'Error updating user' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
};
