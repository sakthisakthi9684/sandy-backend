import express from 'express';
import {
  getPublicProducts,
  getPublicProductById,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus
} from '../controllers/productController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no login required)
router.get('/', getPublicProducts);
router.get('/:id', getPublicProductById);

// Admin protected routes
router.get('/admin/all', protectAdmin, getAdminProducts);
router.post('/admin', protectAdmin, createProduct);
router.put('/admin/:id', protectAdmin, updateProduct);
router.delete('/admin/:id', protectAdmin, deleteProduct);
router.patch('/admin/:id/toggle-status', protectAdmin, toggleProductStatus);

export default router;

