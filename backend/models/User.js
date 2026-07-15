const db = require('../config/db');

class User {
  /**
   * Create a new user in the database.
   * @param {Object} userData
   * @param {string} userData.name
   * @param {string} userData.email
   * @param {string} userData.password (Pre-hashed bcrypt password)
   * @returns {Promise<Object>} Created user metadata
   */
  static async create({ name, email, password }) {
    const user = await db.user.create({
      data: { name, email, password }
    });
    return { id: user.id, name: user.name, email: user.email };
  }

  /**
   * Find user by email address.
   * @param {string} email
   * @returns {Promise<Object|null>} User database row or null
   */
  static async findByEmail(email) {
    return await db.user.findUnique({
      where: { email }
    });
  }

  /**
   * Find user by ID (excluding password for security).
   * @param {number} id
   * @returns {Promise<Object|null>} Safe user metadata or null
   */
  static async findById(id) {
    return await db.user.findUnique({
      where: { id: parseInt(id, 10) },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }
}

module.exports = User;
