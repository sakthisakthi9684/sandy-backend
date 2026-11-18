import express from 'express';
import { adjustStock, getStockHistory, getStockAlerts } from '../controllers/stockController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/adjust', protectAdmin, adjustStock);
router.get('/history', protectAdmin, getStockHistory);
router.get('/alerts', protectAdmin, getStockAlerts);

export default router;

