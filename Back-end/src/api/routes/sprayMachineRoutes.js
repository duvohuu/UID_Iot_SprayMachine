import express from 'express';
import {
    getSprayRealtimeData,
    getSprayDailyData,
    getSpray30DaysHistory,
    getSprayStatistics,
    getSprayPieChartData
} from '../controllers/sprayMachineController.js';

const router = express.Router();

/**
 * ========================================
 * SPRAY MACHINE ROUTES
 * ========================================
 */

// GET /api/spray-machine/realtime/:machineId
router.get('/realtime/:machineId', getSprayRealtimeData);

// GET /api/spray-machine/daily/:machineId
router.get('/daily/:machineId', getSprayDailyData);

// GET /api/spray-machine/history/:machineId
router.get('/history/:machineId', getSpray30DaysHistory);

// GET /api/spray-machine/statistics/:machineId
router.get('/statistics/:machineId', getSprayStatistics);

// GET /api/spray-machine/pie-chart/:machineId
router.get('/pie-chart/:machineId', getSprayPieChartData);

export default router;