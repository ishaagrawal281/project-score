const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

/**
 * Generate a JWT for user session authentication.
 * @param {Object} payload Payload to sign { id, email, name }
 * @returns {string} Signed JWT
 */
const generateJwt = (payload) => {
  const secret = process.env.JWT_SECRET || 'document_vault_secret_token_123456789_abcdef';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Generate a cryptographically secure random string for public share links.
 * Returns a clean 16-character uppercase string.
 */
const generateShareToken = () => {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
};

module.exports = {
  generateJwt,
  generateShareToken
};
