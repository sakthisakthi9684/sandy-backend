import express from 'express';
import {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus
} from '../controllers/enquiryController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: Submit enquiry or order intent
router.post('/', createEnquiry);

// Admin: View and manage enquiries
router.get('/', protectAdmin, getEnquiries);
router.patch('/:id/status', protectAdmin, updateEnquiryStatus);

export default router;

