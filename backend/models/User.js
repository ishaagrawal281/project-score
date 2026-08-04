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
  static async create({ name, email, password, image = null, provider = 'credentials', googleId = null }) {
    const data = { name, email, password };
    if (image) data.image = image;
    if (provider !== 'credentials') data.provider = provider;
    if (googleId) data.googleId = googleId;

    const user = await db.user.create({
      data
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      provider: user.provider
    };
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

  static async findByGoogleId(googleId) {
    return await db.user.findUnique({
      where: { googleId }
    });
  }

  static async linkGoogleAccount(userId, { name, image, googleId }) {
    const user = await db.user.update({
      where: { id: userId },
      data: {
        name,
        image,
        googleId,
        provider: 'credentials,google'
      }
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      provider: user.provider
    };
  }

  static async updateGoogleProfile(userId, { name, image }) {
    const user = await db.user.update({
      where: { id: userId },
      data: { name, image }
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      provider: user.provider
    };
  }

  static async findById(id) {
    return await db.user.findUnique({
      where: { id: parseInt(id, 10) },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        provider: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  static async findWithPasswordById(id) {
    return await db.user.findUnique({
      where: { id: parseInt(id, 10) }
    });
  }


  static async updateEmail(id, email) {
    const user = await db.user.update({
      where: { id: parseInt(id, 10) },
      data: { email }
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      provider: user.provider
    };
  }

  static async updatePassword(id, hashedPassword) {
    await db.user.update({
      where: { id: parseInt(id, 10) },
      data: { password: hashedPassword }
    });
    return true;
  }

  static async deleteAccount(id) {
    await db.user.delete({
      where: { id: parseInt(id, 10) }
    });
    return true;
  }

  static async getStorageUsage(id) {
    const result = await db.document.aggregate({
      where: { userId: parseInt(id, 10) },
      _sum: { size: true },
      _count: { id: true }
    });
    const usedBytes = result._sum.size || 0;
    const totalCount = result._count.id || 0;
    const totalLimitBytes = 100 * 1024 * 1024; // 100 MB
    const percentage = Math.min(Math.round((usedBytes / totalLimitBytes) * 100 * 100) / 100, 100);
    return {
      usedBytes,
      totalLimitBytes,
      percentage,
      totalCount
    };
  }
}

module.exports = User;

