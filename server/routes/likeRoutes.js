import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getLikes, toggleLike } from '../controllers/likeController.js';
import { protect } from '../middleware/authMiddleware.js';

const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // Token invalid or expired — continue without user
    }
  }
  next();
};

const router = express.Router();

router.route('/posts/:postId/likes')
  .get(optionalAuth, getLikes)
  .post(protect, toggleLike);

export default router;
