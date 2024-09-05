const User = require('../models/User');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/email');
const crypto = require('crypto');



// Register a new user
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'unsuccessful',
        message: 'Email is already registered.'
      });
    }

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({ name, email, password: hashedPassword, verificationToken });
    console.log('User before save:', user);
    await user.save();
    console.log('User After save:', user);

    await sendVerificationEmail(user, verificationToken);

    // Respond with success message
    res.status(201).json({
      status: 'success',
      message: 'User registered. Please check your email to verify your account.'
    });
  } catch (error) {
    // Handle unexpected errors
    console.error('Registration error:', error);
    res.status(500).json({ msg: 'An unexpected error occurred. Please try again later.' });
  }
};

// Log in an existing user
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: 'unsuccessful',
        message: 'Invalid email or password.'
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({
        status: 'unsuccessful',
        message: 'Please verify your email before logging in.'
      });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'unsuccessful',
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT using the generateToken function
    const token = generateToken(user._id);

    // Respond with success message and token
    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ status: 'unsuccessful', message: 'Invalid or expired token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Remove the token once used
    await user.save();

    res.status(200).json({ status: 'successful', message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ status: 'unsuccessful', message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ status: 'unsuccessful', message: 'User with this email does not exist.' });
    }

    // Generate a numeric reset code (e.g., 6 digits)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = crypto.createHash('sha256').update(resetCode).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // Code expires in 1 hour
    await user.save();

    // Send email with reset code
    await sendResetPasswordEmail(user.email, resetCode);

    res.status(200).json({
      status: 'success',
      message: 'Password reset code sent to email!',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ status: 'unsuccessful', message: 'Error occurred. Please try again.' });
  }
};

const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure the code is still valid
    });

    if (!user) {
      return res.status(400).json({ status: 'unsuccessful', message: 'Invalid or expired code.' });
    }

    // Hash the provided code and compare it with the stored hash
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    if (user.resetPasswordCode !== hashedCode) {
      return res.status(400).json({ status: 'unsuccessful', message: 'Invalid code.' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Code verified. You may now reset your password.'
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ status: 'unsuccessful', message: 'Error occurred. Please try again.' });
  }
};

// Reset Password Handler
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordExpires: { $gt: Date.now() },
      resetPasswordCode: { $ne: null } // Ensure the user has a valid reset code
    });

    if (!user) {
      return res.status(400).json({ status: 'unsuccessful', message: 'Invalid or expired code.' });
    }

    // Set new password and clear reset fields
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ status: 'success', message: 'Password has been reset!' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ status: 'unsuccessful', message: 'Error occurred. Please try again.' });
  }
};

module.exports = { register, login, verifyEmail, forgotPassword, verifyResetCode, resetPassword };
