import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import { protect, authorizePostOwnership } from '../middleware/authMiddleware.js'; // Corrected casing here

const router = express.Router();

router.route('/')
  .get(getPosts)
  .post(protect, createPost); // Added 'protect' middleware

router.route('/:id')
  .get(getPostById)
  .put(protect, authorizePostOwnership, updatePost) // Added 'protect' and 'authorizePostOwnership' middleware
  .delete(protect, authorizePostOwnership, deletePost); // Added 'protect' and 'authorizePostOwnership' middleware

export default router;