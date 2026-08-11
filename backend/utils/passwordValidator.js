/**
 * Modern NIST-aligned Password Validator
 * 
 * Rules:
 * - Minimum 12 characters (allow passphrases, unicode, spaces, max 128 chars)
 * - No arbitrary composition rules (no mandatory uppercase/symbol requirements)
 * - Block common/breached passwords
 * - Block obvious user information (name, username/email local-part, app name)
 */

const COMMON_PASSWORDS = new Set([
  '123456789012',
  '1234567890123',
  'password1234',
  'password12345',
  'qwertyuiop12',
  'qwerty123456',
  'admin12345678',
  'administrator',
  'welcome12345',
  'welcome123456',
  'letmein123456',
  'passphrase123',
  'changeme1234',
  'changeme12345',
  'iloveyou1234',
  'master123456',
  'sunshine1234',
  'football1234',
  'supersecret12',
  'trustnoone123',
  'correcthorsebatterystaple'
]);

const APP_TERMS = ['docvault', 'digilocker', 'vault'];

/**
 * Validate a password against modern NIST SP 800-63B standards.
 * 
 * @param {string} password - The password string to validate
 * @param {Object} [context] - Context containing user details for contextual checks
 * @param {string} [context.name] - User's full name or display name
 * @param {string} [context.email] - User's email address
 * @returns {string|null} Validation error message, or null if valid
 */
const validatePassword = (password, context = {}) => {
  if (!password || typeof password !== 'string' || password.trim() === '') {
    return 'Enter a password.';
  }

  // Length check: minimum 12 characters
  if (password.length < 12) {
    return 'Password must be at least 12 characters.';
  }

  // Maximum safe limit
  if (password.length > 128) {
    return 'Password must not exceed 128 characters.';
  }

  const normalized = password.toLowerCase().trim();

  // Check common / breached passwords list
  if (COMMON_PASSWORDS.has(normalized)) {
    return 'This password is too common or may have been exposed. Choose a different one.';
  }

  // Contextual check: user details (name, email username)
  const forbiddenParts = new Set([...APP_TERMS]);

  if (context.name && typeof context.name === 'string') {
    context.name
      .toLowerCase()
      .split(/[\s._-]+/)
      .filter((part) => part.length >= 3)
      .forEach((part) => forbiddenParts.add(part));
  }

  if (context.email && typeof context.email === 'string') {
    const localPart = context.email.split('@')[0] || '';
    localPart
      .toLowerCase()
      .split(/[\s._\-+0-9]+/)
      .filter((part) => part.length >= 3)
      .forEach((part) => forbiddenParts.add(part));
  }

  for (const part of forbiddenParts) {
    if (normalized.includes(part)) {
      return 'Password must not include your name, username, or email.';
    }
  }

  return null;
};

module.exports = {
  validatePassword
};
