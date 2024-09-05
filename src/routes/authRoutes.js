const express = require('express');
const { register, login, verifyEmail, forgotPassword, verifyResetCode, resetPassword } = require('../controllers/authController');
const router = express.Router();
const validateUser = require('../middlewares/validateUser');

router.post('/register', validateUser, register);
router.post('/login', login);
router.get('/verify/:token', verifyEmail);

// Forgot password route (send reset code)
router.post('/forgot-password', forgotPassword);

// Verify reset code route
router.post('/verify-reset-code', verifyResetCode);

// Reset password route
router.post('/reset-password', resetPassword);

module.exports = router;
