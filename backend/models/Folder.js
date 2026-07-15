const db = require('../config/db');

class Folder {
  /**
   * Create a new folder.
   * @param {Object} folderData
   * @param {number} folderData.userId
   * @param {number|null} folderData.parentId
   * @param {string} folderData.name
   * @returns {Promise<Object>} Created folder data
   */
  static async create({ userId, parentId, name }) {
    const folder = await db.folder.create({
      data: {
        userId: parseInt(userId, 10),
        parentId: parentId ? parseInt(parentId, 10) : null,
        name
      }
    });
    return { id: folder.id, userId, parentId, name };
  }

  /**
   * Find a folder by ID.
   * @param {number} id
   * @returns {Promise<Object|null>} Folder data or null
   */
  static async findById(id) {
    return await db.folder.findUnique({
      where: { id: parseInt(id, 10) }
    });
  }

  /**
   * Find a user's folder by name and parentId.
   * @param {string} name
   * @param {number} userId
   * @param {number|null} parentId
   * @returns {Promise<Object|null>} Folder data or null
   */
  static async findByNameAndUser(name, userId, parentId) {
    return await db.folder.findFirst({
      where: {
        name,
        userId: parseInt(userId, 10),
        parentId: parentId ? parseInt(parentId, 10) : null
      }
    });
  }

  /**
   * Get all folders belonging to a user.
   * @param {number} userId
   * @returns {Promise<Array>} List of folders
   */
  static async findByUser(userId) {
    return await db.folder.findMany({
      where: { userId: parseInt(userId, 10) },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Rename a folder.
   * @param {number} id
   * @param {string} newName
   * @returns {Promise<boolean>} Success state
   */
  static async rename(id, newName) {
    const folder = await db.folder.update({
      where: { id: parseInt(id, 10) },
      data: { name: newName }
    });
    return !!folder;
  }

  /**
   * Delete a folder.
   * @param {number} id
   * @returns {Promise<boolean>} Success state
   */
  static async delete(id) {
    const result = await db.folder.delete({
      where: { id: parseInt(id, 10) }
    });
    return !!result;
  }

  /**
   * Checks if a folder has any files or subfolders inside.
   * @param {number} id
   * @returns {Promise<boolean>} True if folder contains no files and no subfolders.
   */
  static async isEmpty(id) {
    const folderId = parseInt(id, 10);
    const childFoldersCount = await db.folder.count({
      where: { parentId: folderId }
    });
    const childDocsCount = await db.document.count({
      where: { folderId }
    });
    return childFoldersCount === 0 && childDocsCount === 0;
  }
}

module.exports = Folder;
