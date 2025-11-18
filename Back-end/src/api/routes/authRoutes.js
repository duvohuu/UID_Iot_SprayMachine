import express from 'express';
import { login, logout, refreshToken, verifyToken } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * ========================================
 * AUTH ROUTES
 * ========================================
 */

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logout);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', refreshToken);

// @route   GET /api/auth/verify-token
// @desc    Verify if token is valid
// @access  Public
router.get('/verify-token', verifyToken);

export default router;
