import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost
} from '../controllers/postController.js';

const router = express.Router();

// All routes require authentication
router.post('/', protect, createPost);
router.get('/', protect, getPosts);
router.get('/:id', protect, getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

export default router;
