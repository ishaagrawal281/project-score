const db = require('../config/db');

class Document {
  /**
   * Create a new document metadata record.
   * @param {Object} docData
   * @param {number} docData.userId
   * @param {number} docData.folderId
   * @param {string} docData.filename
   * @param {string} docData.cloudUrl
   * @param {string} docData.fileType
   * @param {number} docData.size
   * @returns {Promise<Object>} Created document metadata
   */
  static async create({ userId, folderId, filename, cloudUrl, fileType, size }) {
    const document = await db.document.create({
      data: {
        userId: parseInt(userId, 10),
        folderId: parseInt(folderId, 10),
        filename,
        cloudUrl,
        fileType,
        size: parseInt(size, 10)
      }
    });
    return document;
  }

  /**
   * Find document by ID.
   * @param {number} id
   * @returns {Promise<Object|null>} Document details or null
   */
  static async findById(id) {
    return await db.document.findUnique({
      where: { id: parseInt(id, 10) }
    });
  }

  /**
   * Retrieve list of documents matching filter/search parameters.
   * @param {Object} filterOptions
   * @param {number} filterOptions.userId
   * @param {number|null} filterOptions.folderId
   * @param {string|null} filterOptions.search
   * @param {number} filterOptions.limit
   * @param {number} filterOptions.offset
   * @returns {Promise<Array>} List of documents
   */
  static async findByUser({ userId, folderId, search, limit, offset }) {
    const where = {
      userId: parseInt(userId, 10)
    };

    if (search) {
      where.filename = {
        contains: search,
        mode: 'insensitive' // case-insensitive search
      };
    } else if (folderId) {
      where.folderId = parseInt(folderId, 10);
    }

    return await db.document.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10)
    });
  }

  /**
   * Count total documents matching filter/search parameters.
   * @param {Object} filterOptions
   * @param {number} filterOptions.userId
   * @param {number|null} filterOptions.folderId
   * @param {string|null} filterOptions.search
   * @returns {Promise<number>} Total count
   */
  static async countByUser({ userId, folderId, search }) {
    const where = {
      userId: parseInt(userId, 10)
    };

    if (search) {
      where.filename = {
        contains: search,
        mode: 'insensitive'
      };
    } else if (folderId) {
      where.folderId = parseInt(folderId, 10);
    }

    return await db.document.count({
      where
    });
  }

  /**
   * Move a document to a different folder.
   * @param {number} id
   * @param {number} folderId
   * @returns {Promise<boolean>} Success state
   */
  static async moveToFolder(id, folderId) {
    const document = await db.document.update({
      where: { id: parseInt(id, 10) },
      data: { folderId: parseInt(folderId, 10) }
    });
    return !!document;
  }

  /**
   * Delete document metadata from database.
   * @param {number} id
   * @returns {Promise<boolean>} Success state
   */
  static async delete(id) {
    const result = await db.document.delete({
      where: { id: parseInt(id, 10) }
    });
    return !!result;
  }
}

module.exports = Document;
