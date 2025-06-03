import express, { RequestHandler } from 'express';
import { protect, admin } from '../middleware/auth';
import { updateUserProfile, deleteUser, getAllUsers } from '../controllers/userController';

const router = express.Router();

// Protected routes
router.put('/profile', protect, updateUserProfile as RequestHandler);
router.delete('/:id', protect, admin, deleteUser as RequestHandler);

// Admin routes
router.get('/', protect, admin, getAllUsers as RequestHandler);

export default router; 