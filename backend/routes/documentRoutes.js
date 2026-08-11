const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validateFileUpload } = require('../middleware/validationMiddleware');

// Secure all document routes
router.use(authMiddleware);

// Upload a single file with name attribute 'file'
router.post('/upload', upload.single('file'), validateFileUpload, documentController.uploadDocument);
router.get('/', documentController.getDocuments);
router.delete('/:id', documentController.deleteDocument);
router.put('/:id/move', documentController.moveDocument);
router.put('/:id/favorite', documentController.toggleFavoriteDocument);

module.exports = router;
