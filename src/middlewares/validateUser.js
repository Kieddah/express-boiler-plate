// src/middlewares/validateUser.js

// Middleware to validate user registration details
const validateUser = (req, res, next) => {
    const { name, email, password } = req.body;
  
    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please provide all required fields: name, email, and password.' });
    }
  
    // Check if email is in a valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: 'Please provide a valid email address.' });
    }
  
    // Check if the password meets the required criteria (e.g., minimum length)
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long.' });
    }
  
    // If all validations pass, proceed to the next middleware/controller
    next();
  };
  
  module.exports = validateUser;
  