// server/routes/commentRoutes.js
import express from 'express';
import {
  getComments,
  createComment,
  deleteComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js'; // Import the protect middleware

const router = express.Router();

// GET comments for a specific post (publicly accessible)
router.route('/posts/:postId/comments')
  .get(getComments)
  // POST a comment for a specific post (requires authentication)
  .post(protect, createComment); // Apply 'protect' middleware here

// DELETE a comment by its ID (requires authentication + ownership check)
router.route('/comments/:id').delete(protect, deleteComment); // 'protect' is applied, ownership check will be in controller

export default router;