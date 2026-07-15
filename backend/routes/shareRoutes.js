const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');
const authMiddleware = require('../middleware/authMiddleware');

// Generating a share link requires active user authentication
router.post('/:documentId', authMiddleware, shareController.createShareLink);

// Retrieving/accessing shared document details is a public endpoint
router.get('/:token', shareController.getSharedDocument);

module.exports = router;
