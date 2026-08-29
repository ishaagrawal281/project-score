const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBody, CreateFolderSchema, RenameFolderSchema } = require('../middleware/structuredOutputSchemas');

// Secure all folder routes
router.use(authMiddleware);

// Structured Output validation ensures request bodies match expected schemas
router.post('/', validateBody(CreateFolderSchema), folderController.createFolder);
router.get('/', folderController.getFolders);
router.put('/:id', validateBody(RenameFolderSchema), folderController.renameFolder);
router.delete('/:id', folderController.deleteFolder);

module.exports = router;
