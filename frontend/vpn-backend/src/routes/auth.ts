import express, { RequestHandler } from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', registerUser as RequestHandler);
router.post('/login', loginUser as RequestHandler);

// Protected routes
router.get('/profile', protect, getUserProfile as RequestHandler);

export default router; 