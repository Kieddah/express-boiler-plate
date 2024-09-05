// src/routes/userRoutes.js
const express = require('express');
const { getAllUsers, getUserById, updateUser } = require('../controllers/userController');
const { verifyToken } = require('../utils/jwt'); 

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, updateUser);

module.exports = router;
