import express from 'express';
import { upload } from '../middleware/upload.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

const getUploadUrl = (req, filename) => {
  const forwardedProtocol = req.headers['x-forwarded-proto'];
  const protocol = (Array.isArray(forwardedProtocol) ? forwardedProtocol[0] : forwardedProtocol?.split(',')[0]) || req.protocol;
  return `${protocol}://${req.get('host')}/uploads/${filename}`;
};

router.post('/single', protectAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = getUploadUrl(req, req.file.filename);
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename
  });
});

router.post('/multiple', protectAdmin, upload.array('images', 8), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }
  const urls = req.files.map(file => getUploadUrl(req, file.filename));
  res.json({
    success: true,
    urls
  });
});

export default router;

