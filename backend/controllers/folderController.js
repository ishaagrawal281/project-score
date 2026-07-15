const Folder = require('../models/Folder');

/**
 * Create a new folder.
 */
const createFolder = async (req, res, next) => {
  try {
    const { name, parentId } = req.body;
    const userId = req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Folder name is required.' });
    }

    const sanitizedName = name.trim();
    const actualParentId = parentId ? parseInt(parentId, 10) : null;

    // Check if the parent folder belongs to the user
    if (actualParentId !== null) {
      const parentFolder = await Folder.findById(actualParentId);
      if (!parentFolder || parentFolder.userId !== userId) {
        return res.status(404).json({ error: 'Parent directory not found.' });
      }
    }

    // Verify folder name uniqueness within the same directory level
    const duplicate = await Folder.findByNameAndUser(sanitizedName, userId, actualParentId);
    if (duplicate) {
      return res.status(400).json({ error: 'A folder with this name already exists in this directory.' });
    }

    const folder = await Folder.create({
      userId,
      parentId: actualParentId,
      name: sanitizedName
    });

    return res.status(201).json({
      message: 'Folder created successfully.',
      folder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve all folders belonging to the user.
 */
const getFolders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const folders = await Folder.findByUser(userId);
    return res.status(200).json({ folders });
  } catch (error) {
    next(error);
  }
};

/**
 * Rename an existing folder.
 */
const renameFolder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'New folder name is required.' });
    }

    const sanitizedName = name.trim();
    const folder = await Folder.findById(id);

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found.' });
    }

    if (folder.userId !== userId) {
      return res.status(403).json({ error: 'Permission denied. You cannot modify folders owned by other users.' });
    }

    // Check for naming collisions within same parent level
    const duplicate = await Folder.findByNameAndUser(sanitizedName, userId, folder.parentId);
    if (duplicate && duplicate.id !== parseInt(id, 10)) {
      return res.status(400).json({ error: 'Another folder with this name already exists in this directory.' });
    }

    await Folder.rename(id, sanitizedName);
    
    return res.status(200).json({
      message: 'Folder renamed successfully.',
      folder: { ...folder, name: sanitizedName }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a folder (only if empty).
 */
const deleteFolder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const folder = await Folder.findById(id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found.' });
    }

    if (folder.userId !== userId) {
      return res.status(403).json({ error: 'Permission denied. You cannot delete folders owned by other users.' });
    }

    // Check if folder contains files or subfolders
    const isEmpty = await Folder.isEmpty(id);
    if (!isEmpty) {
      return res.status(400).json({
        error: 'Folder is not empty. Please move or delete its contents before removing it.'
      });
    }

    await Folder.delete(id);
    return res.status(200).json({ message: 'Folder deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFolder,
  getFolders,
  renameFolder,
  deleteFolder
};
