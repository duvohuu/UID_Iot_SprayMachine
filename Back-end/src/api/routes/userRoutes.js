import express from 'express';
import { 
    getProfile, 
    updateProfile, 
    changePassword, 
    updateAvatar,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';
import { uploadAvatar } from '../middlewares/upload.middleware.js';

const router = express.Router();

/**
 * ========================================
 * USER ROUTES
 * ========================================
 */

// User Profile Routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/avatar', protect, uploadAvatar.single('avatar'), updateAvatar);

// Admin Routes
router.get('/', protect, adminOnly, getAllUsers);
router.get('/:userId', protect, adminOnly, getUserById);
router.post('/', protect, adminOnly, createUser);
router.put('/:userId', protect, adminOnly, updateUser);
router.delete('/:userId', protect, adminOnly, deleteUser);

export default router;
