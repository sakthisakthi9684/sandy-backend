import express from 'express';
import { getSettings, updateSettings, getDashboardAnalytics } from '../controllers/settingsController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/', getSettings);

// Admin protected
router.put('/', protectAdmin, updateSettings);
router.get('/analytics', protectAdmin, getDashboardAnalytics);

export default router;

