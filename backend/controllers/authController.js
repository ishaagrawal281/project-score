const User = require('../models/User');
const Folder = require('../models/Folder');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateJwt } = require('../utils/token');
const { validatePassword } = require('../utils/passwordValidator');

const createDefaultFolders = async (userId) => {
  const rootFolder = await Folder.create({
    userId,
    parentId: null,
    name: 'My Documents'
  });

  const subfolderNames = ['Identity', 'Education', 'Finance', 'Employment', 'Medical', 'Others'];
  for (const name of subfolderNames) {
    await Folder.create({ userId, parentId: rootFolder.id, name });
  }
};

/**
 * Handle user registration (Signup).
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields (name, email, password) are required.' });
    }

    const passwordError = validatePassword(password, { name, email });
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Check if email already registered
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    await createDefaultFolders(newUser.id);

    // Generate session JWT token
    const token = generateJwt({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    });

    return res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify a Google ID token, then create or link the matching local account.
 * The token is verified by Google before any user data is trusted.
 */
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required.' });
    }

    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );
    if (!response.ok) {
      return res.status(401).json({ error: 'Google authentication could not be verified.' });
    }

    const profile = await response.json();
    if (
      profile.aud !== process.env.GOOGLE_CLIENT_ID ||
      profile.email_verified !== 'true' ||
      !profile.email ||
      !profile.sub
    ) {
      return res.status(401).json({ error: 'Invalid Google account information.' });
    }

    const name = profile.name || profile.email.split('@')[0];
    const image = profile.picture || null;
    let user = await User.findByGoogleId(profile.sub);

    if (user) {
      user = await User.updateGoogleProfile(user.id, { name, image });
    } else {
      const existingUser = await User.findByEmail(profile.email);
      if (existingUser) {
        user = await User.linkGoogleAccount(existingUser.id, {
          name,
          image,
          googleId: profile.sub
        });
      } else {
        const generatedPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
        user = await User.create({
          name,
          email: profile.email,
          password: generatedPassword,
          image,
          provider: 'google',
          googleId: profile.sub
        });
        await createDefaultFolders(user.id);
      }
    }

    const token = generateJwt({ id: user.id, name: user.name, email: user.email });
    return res.status(200).json({
      message: 'Google login successful.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user authentication (Login).
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please check your email and password.' });
    }

    // Validate password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Please check your email and password.' });
    }

    // Generate session JWT token
    const token = generateJwt({
      id: user.id,
      name: user.name,
      email: user.email
    });

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve verified user profile with storage usage.
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    const storage = await User.getStorageUsage(req.user.id);
    return res.status(200).json({ user, storage });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user email address.
 */
const updateEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();

    // Check if another user already has this email
    const existing = await User.findByEmail(cleanEmail);
    if (existing && existing.id !== req.user.id) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const updatedUser = await User.updateEmail(req.user.id, cleanEmail);

    // Generate new JWT token with updated email
    const token = generateJwt({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email
    });

    return res.status(200).json({
      message: 'Email updated successfully.',
      user: updatedUser,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user password.
 */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current password and new password are required.' });
    }

    const userWithPassword = await User.findWithPasswordById(req.user.id);
    if (!userWithPassword) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const passwordError = validatePassword(newPassword, {
      name: userWithPassword.name,
      email: userWithPassword.email
    });
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const isMatch = await bcrypt.compare(currentPassword, userWithPassword.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(req.user.id, hashedPassword);

    return res.status(200).json({
      message: 'Password updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user account.
 */
const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    await User.deleteAccount(req.user.id);

    return res.status(200).json({
      message: 'Account deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  googleLogin,
  getProfile,
  updateEmail,
  updatePassword,
  deleteAccount
};

