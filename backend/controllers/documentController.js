const Document = require('../models/Document');
const Folder = require('../models/Folder');
const storageService = require('../services/storageService');

/**
 * Handle document uploads.
 */
const uploadDocument = async (req, res, next) => {
  try {
    const { folderId } = req.body;
    const userId = req.user.id;

    if (!folderId) {
      return res.status(400).json({ error: 'Target folder is required.' });
    }

    // Verify folder existence and owner authorization
    const folder = await Folder.findById(folderId);
    if (!folder || folder.userId !== userId) {
      return res.status(404).json({ error: 'Target directory does not exist.' });
    }

    const file = req.file;

    // Upload to active storage provider (GCS or Local)
    const cloudUrl = await storageService.uploadFile(file);

    // Save metadata in MySQL
    const document = await Document.create({
      userId,
      folderId: parseInt(folderId, 10),
      filename: file.originalname,
      cloudUrl,
      fileType: file.mimetype,
      size: file.size
    });

    return res.status(201).json({
      message: 'Document uploaded successfully.',
      document
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve paginated documents with search parameters.
 */
const getDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { folderId, search } = req.query;

    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = (page - 1) * limit;

    const parsedFolderId = folderId ? parseInt(folderId, 10) : null;

    // If searching, check all user documents. If browsing a folder, double check folder ownership first
    if (parsedFolderId && !search) {
      const targetFolder = await Folder.findById(parsedFolderId);
      if (!targetFolder || targetFolder.userId !== userId) {
        return res.status(404).json({ error: 'Directory not found.' });
      }
    }

    const documents = await Document.findByUser({
      userId,
      folderId: parsedFolderId,
      search: search ? search.trim() : null,
      limit,
      offset
    });

    const totalDocs = await Document.countByUser({
      userId,
      folderId: parsedFolderId,
      search: search ? search.trim() : null
    });

    return res.status(200).json({
      documents,
      pagination: {
        page,
        limit,
        totalDocs,
        totalPages: Math.ceil(totalDocs / limit),
        hasMore: offset + documents.length < totalDocs
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a document from storage and SQL database.
 */
const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (document.userId !== userId) {
      return res.status(403).json({ error: 'Permission denied. You cannot delete files owned by other users.' });
    }

    // 1. Remove file resource from active storage (GCS/Local disk)
    await storageService.deleteFile(document.cloudUrl);

    // 2. Remove SQL database row
    await Document.delete(id);

    return res.status(200).json({ message: 'Document deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Move a document between folders.
 */
const moveDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { folderId } = req.body;
    const userId = req.user.id;

    if (!folderId) {
      return res.status(400).json({ error: 'Target folder ID is required.' });
    }

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (document.userId !== userId) {
      return res.status(403).json({ error: 'Permission denied. You cannot modify files owned by other users.' });
    }

    // Verify destination folder exists and belongs to the user
    const destFolder = await Folder.findById(folderId);
    if (!destFolder || destFolder.userId !== userId) {
      return res.status(404).json({ error: 'Target directory not found.' });
    }

    await Document.moveToFolder(id, parseInt(folderId, 10));

    return res.status(200).json({
      message: 'Document relocated successfully.',
      document: { ...document, folderId: parseInt(folderId, 10) }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  deleteDocument,
  moveDocument
};
