const User = require('../models/User');
const Folder = require('../models/Folder');
const bcrypt = require('bcryptjs');
const { generateJwt } = require('../utils/token');

/**
 * Handle user registration (Signup).
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields (name, email, password) are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
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

    // Create Default DigiLocker folder structure
    // 1. Create root "My Documents" folder
    const rootFolder = await Folder.create({
      userId: newUser.id,
      parentId: null,
      name: 'My Documents'
    });

    // 2. Create subfolders under "My Documents"
    const subfolderNames = ['Identity', 'Education', 'Finance', 'Employment', 'Medical', 'Others'];
    for (const name of subfolderNames) {
      await Folder.create({
        userId: newUser.id,
        parentId: rootFolder.id,
        name: name
      });
    }

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
 * Retrieve verified user profile.
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getProfile
};
