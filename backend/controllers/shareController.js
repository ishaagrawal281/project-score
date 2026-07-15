const ShareLink = require('../models/ShareLink');
const Document = require('../models/Document');
const { generateShareToken } = require('../utils/token');

/**
 * Generate a public expiring share link.
 */
const createShareLink = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { expiry } = req.body; // '10m', '1h', '24h'
    const userId = req.user.id;

    // Verify document existence and owner authorization
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (document.userId !== userId) {
      return res.status(403).json({ error: 'Permission denied. You can only share your own files.' });
    }

    // Calculate expiration timestamp
    let offsetMs = 24 * 60 * 60 * 1000; // default 24 Hours
    if (expiry === '10m') {
      offsetMs = 10 * 60 * 1000;
    } else if (expiry === '1h') {
      offsetMs = 60 * 60 * 1000;
    } else if (expiry === '24h') {
      offsetMs = 24 * 60 * 60 * 1000;
    } else {
      return res.status(400).json({ error: 'Invalid expiry. Please choose "10m" (10 Minutes), "1h" (1 Hour), or "24h" (24 Hours).' });
    }

    const expiresAt = new Date(Date.now() + offsetMs);
    const token = generateShareToken();

    await ShareLink.create({
      documentId: parseInt(documentId, 10),
      token,
      expiresAt
    });

    return res.status(201).json({
      message: 'Share link generated successfully.',
      token,
      expiresAt,
      // The client will prepend its base domain to form the full URL
      sharePath: `/share/${token}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Access a public shared document.
 */
const getSharedDocument = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Run lazy garbage collection on expired share links
    try {
      await ShareLink.deleteExpired();
    } catch (dbErr) {
      console.error('Failed to run lazy expired share link cleanup:', dbErr.message);
    }

    const shareLink = await ShareLink.findByToken(token);
    if (!shareLink) {
      return res.status(404).json({ error: 'This shared link does not exist, or has been revoked/deleted.' });
    }

    // Validate link expiration timestamp
    const now = new Date();
    const expiryTime = new Date(shareLink.expiresAt);
    if (now > expiryTime) {
      return res.status(410).json({ error: 'This link has expired.' });
    }

    return res.status(200).json({
      document: {
        filename: shareLink.filename,
        cloudUrl: shareLink.cloudUrl,
        fileType: shareLink.fileType,
        size: shareLink.size
      },
      expiresAt: shareLink.expiresAt
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createShareLink,
  getSharedDocument
};
