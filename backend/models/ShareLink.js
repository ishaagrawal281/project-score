const db = require('../config/db');

class ShareLink {
  /**
   * Generate an expiring share link entry.
   * @param {Object} shareData
   * @param {number} shareData.documentId
   * @param {string} shareData.token
   * @param {Date} shareData.expiresAt
   * @returns {Promise<Object>} Created share link data
   */
  static async create({ documentId, token, expiresAt }) {
    const shareLink = await db.shareLink.create({
      data: {
        documentId: parseInt(documentId, 10),
        token,
        expiresAt
      }
    });
    return { id: shareLink.id, documentId, token, expiresAt };
  }

  /**
   * Find a share link by token, joining document metadata.
   * @param {string} token
   * @returns {Promise<Object|null>} Share link + Document metadata or null
   */
  static async findByToken(token) {
    const shareLink = await db.shareLink.findUnique({
      where: { token },
      include: {
        document: true
      }
    });

    if (!shareLink) return null;

    // Return object structured exactly like the original SQL join select list
    return {
      id: shareLink.id,
      documentId: shareLink.documentId,
      token: shareLink.token,
      expiresAt: shareLink.expiresAt,
      createdAt: shareLink.createdAt,
      filename: shareLink.document.filename,
      cloudUrl: shareLink.document.cloudUrl,
      fileType: shareLink.document.fileType,
      size: shareLink.document.size,
      userId: shareLink.document.userId
    };
  }

  /**
   * Delete expired share links from the database.
   * @returns {Promise<number>} Number of deleted records
   */
  static async deleteExpired() {
    const result = await db.shareLink.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    return result.count;
  }
}

module.exports = ShareLink;
