const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public authentication routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected profile route
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
