const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public authentication routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/auth/google', authController.googleLogin);

// Protected profile routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/user/email', authMiddleware, authController.updateEmail);
router.put('/user/password', authMiddleware, authController.updatePassword);
router.delete('/user', authMiddleware, authController.deleteAccount);

module.exports = router;

