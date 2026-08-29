const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBody, CreateShareLinkSchema } = require('../middleware/structuredOutputSchemas');

// Generating a share link requires active user authentication
// Structured Output validation ensures expiry is one of the allowed values
router.post('/:documentId', authMiddleware, validateBody(CreateShareLinkSchema), shareController.createShareLink);

// Retrieving/accessing shared document details is a public endpoint
router.get('/:token', shareController.getSharedDocument);

module.exports = router;
