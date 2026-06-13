import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Post from '../models/Post.js'; // Make sure Post model is imported if authorizePostOwnership is in this file

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const JWT_SECRET = process.env.JWT_SECRET;
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found.' });
      }

      return next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token.' });
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