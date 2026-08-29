const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBody, SignupSchema, LoginSchema, UpdateEmailSchema, UpdatePasswordSchema } = require('../middleware/structuredOutputSchemas');

// Public authentication routes — Structured Output validation applied
router.post('/signup', validateBody(SignupSchema), authController.signup);
router.post('/login', validateBody(LoginSchema), authController.login);
router.post('/auth/google', authController.googleLogin);

// Protected profile routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/user/email', authMiddleware, validateBody(UpdateEmailSchema), authController.updateEmail);
router.put('/user/password', authMiddleware, validateBody(UpdatePasswordSchema), authController.updatePassword);
router.delete('/user', authMiddleware, authController.deleteAccount);

module.exports = router;
