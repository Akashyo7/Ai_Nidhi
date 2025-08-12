import { Router } from 'express';
import { register, login, getProfile, updateProfile, logout } from '@/controllers/authController';
import { authenticateToken } from '@/middleware/auth';
import { validateRequest } from '@/utils/validation';
import { registerSchema, loginSchema, updateProfileSchema } from '@/utils/validation';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateRequest(updateProfileSchema), updateProfile);
router.post('/logout', authenticateToken, logout);

export default router;