import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Post from '../models/Post.js'; // Make sure Post model is imported if authorizePostOwnership is in this file

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const protect = async (req, res, next) => {
  let token;

  // Debugging logs
  console.log('--- Auth Middleware ---');
  console.log('Request headers:', req.headers);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Extracted Token:', token); // Debugging log

      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Decoded Token:', decoded); // Debugging log

      req.user = await User.findById(decoded.id).select('-password');
      console.log('User found in DB (req.user):', req.user); // Debugging log

      if (!req.user) {
        console.log('Auth failed: User not found in DB for decoded ID.'); // Debugging log
        return res.status(401).json({ message: 'User not found.' });
      }

      next();
    } catch (err) {
      console.error('Auth middleware error (verify/find):', err.message); // More detailed error logging
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    console.log('Auth failed: No token found in headers.'); // Debugging log
    return res.status(401).json({ message: 'Not authorized, no token.' });
  }
  console.log('--- End Auth Middleware ---'); // Debugging log
};

const authorizePostOwnership = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to perform this action.' });
    }

    next();
  } catch (error) {
    console.error('Ownership middleware error:', error);
    return res.status(500).json({ message: 'Server error during authorization check.' });
  }
};

export { protect, authorizePostOwnership };