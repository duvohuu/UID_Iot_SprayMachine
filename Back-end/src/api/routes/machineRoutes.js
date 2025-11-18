import express from 'express';
import {
    getMachines,
    getMachineById,
    createMachine,
    updateMachine,
    deleteMachine
} from '../controllers/machineController.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * ========================================
 * MACHINE ROUTES
 * ========================================
 */

// Get all machines (user sees their machines, admin sees all)
router.get('/', protect, getMachines);

// Get machine by machineId (specific route - must be before /:id)
router.get('/machineId/:id', protect, getMachineById);

// Get machine by ID (general route - supports both _id and machineId)
router.get('/:id', protect, getMachineById);

// Create machine (admin only)
router.post('/', protect, adminOnly, createMachine);

// Update machine (admin only - supports both _id and machineId)
router.put('/:id', protect, adminOnly, updateMachine);

// Delete machine (admin only - supports both _id and machineId)
router.delete('/:id', protect, adminOnly, deleteMachine);

export default router;
