import express from 'express';
import {
  loginAdmin,
  getMe,
  sendAdminRegistrationOtp,
  verifyAdminRegistrationOtp
} from '../controllers/authController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/register/send-otp', sendAdminRegistrationOtp);
router.post('/register/verify-otp', verifyAdminRegistrationOtp);
router.get('/me', protectAdmin, getMe);

export default router;

