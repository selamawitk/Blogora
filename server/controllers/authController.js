// controllers/authController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_EXPIRES_IN = '7d'; // token expiration

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    process.env.JWT_SECRET, // Using process.env.JWT_SECRET directly
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Please fill all fields.' });
    }

    // Check if user/email exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken.' });
    }

    const user = new User({ email, username, password });
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      id: user._id,
      email: user.email,
      username: user.username,
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/signin
// @access  Public
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = generateToken(user);

    res.json({
      id: user._id,
      email: user.email,
      username: user.username,
      token,
    });
  } catch (err) {
    console.error('Sign-in error:', err);
    res.status(500).json({ message: 'Server error during sign-in.' });
  }
};

export { register, signIn }; // Named exports for ES Modules