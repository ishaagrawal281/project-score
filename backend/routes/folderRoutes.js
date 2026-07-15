const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const authMiddleware = require('../middleware/authMiddleware');

// Secure all folder routes
router.use(authMiddleware);

router.post('/', folderController.createFolder);
router.get('/', folderController.getFolders);
router.put('/:id', folderController.renameFolder);
router.delete('/:id', folderController.deleteFolder);

module.exports = router;
