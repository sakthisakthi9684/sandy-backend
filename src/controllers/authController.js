import { createHash, randomInt, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { dataService } from '../services/dataService.js';

const REGISTRATION_OTP_TTL_MS = 10 * 60 * 1000;
const REGISTRATION_OTP_RESEND_MS = 60 * 1000;
const REGISTRATION_OTP_MAX_ATTEMPTS = 5;
const REGISTRATION_IP_WINDOW_MS = 15 * 60 * 1000;
const REGISTRATION_IP_MAX_REQUESTS = 5;
const registrationOtps = new Map();
const lastOtpSentAt = new Map();
const otpRequestsByIp = new Map();

const hashOtp = (email, otp) =>
  createHash('sha256').update(`${email}:${otp}`).digest();

const getMissingSmtpSettings = () =>
  ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']
    .filter((key) => !process.env[key]);

const createAdminToken = (admin) => jwt.sign(
  { id: admin._id, email: admin.email, role: admin.role, name: admin.name },
  process.env.JWT_SECRET || 'santhiya_style_stone_secret_jwt_key_2026_luxury_jewellery',
  { expiresIn: '7d' }
);

const getEmailTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
};

const pruneOtpState = (now) => {
  for (const [email, record] of registrationOtps) {
    if (record.expiresAt <= now) registrationOtps.delete(email);
  }
  for (const [email, sentAt] of lastOtpSentAt) {
    if (now - sentAt > REGISTRATION_IP_WINDOW_MS) lastOtpSentAt.delete(email);
  }
  for (const [ip, timestamps] of otpRequestsByIp) {
    const recent = timestamps.filter((timestamp) => now - timestamp < REGISTRATION_IP_WINDOW_MS);
    if (recent.length) otpRequestsByIp.set(ip, recent);
    else otpRequestsByIp.delete(ip);
  }
};

export const sendAdminRegistrationOtp = async (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  try {
    if (await dataService.findAdminByEmail(email)) {
      return res.status(409).json({ success: false, message: 'An admin account already exists for this email.' });
    }

    const now = Date.now();
    pruneOtpState(now);
    const previousSentAt = lastOtpSentAt.get(email);
    if (previousSentAt && now - previousSentAt < REGISTRATION_OTP_RESEND_MS) {
      const retryAfterSeconds = Math.ceil((REGISTRATION_OTP_RESEND_MS - (now - previousSentAt)) / 1000);
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting another verification code.',
        retryAfterSeconds
      });
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ipRequests = otpRequestsByIp.get(ip) || [];
    if (ipRequests.length >= REGISTRATION_IP_MAX_REQUESTS) {
      return res.status(429).json({ success: false, message: 'Too many verification requests. Please try again later.' });
    }

    const transporter = getEmailTransporter();
    if (!transporter) {
      const missingSettings = getMissingSmtpSettings();
      return res.status(503).json({
        success: false,
        message: missingSettings.length
          ? `SMTP is not configured. Add ${missingSettings.join(', ')} to server/.env and restart the backend.`
          : 'SMTP_PORT must be a valid port number in server/.env.'
      });
    }

    const otp = String(randomInt(100000, 1000000));
    const record = {
      hash: hashOtp(email, otp),
      expiresAt: now + REGISTRATION_OTP_TTL_MS,
      attempts: 0
    };
    registrationOtps.set(email, record);
    lastOtpSentAt.set(email, now);
    otpRequestsByIp.set(ip, [...ipRequests, now]);

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Your Santhiya Style Stone admin verification code',
        text: `Your verification code is ${otp}. It expires in 10 minutes.`,
        html: `<p>Your Santhiya Style Stone admin verification code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:5px">${otp}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>`
      });
    } catch (error) {
      if (registrationOtps.get(email) === record) registrationOtps.delete(email);
      console.error('Admin registration OTP email failed:', error.message);
      return res.status(503).json({ success: false, message: 'Could not send the verification email. Please try again later.' });
    }

    return res.json({ success: true, message: 'Verification code sent. Please check your email.' });
  } catch (error) {
    console.error('Admin registration OTP error:', error);
    return res.status(500).json({ success: false, message: 'Could not start admin registration.' });
  }
};

export const verifyAdminRegistrationOtp = async (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const { name, password, otp } = body;
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return res.status(400).json({ success: false, message: 'Name must be between 2 and 100 characters.' });
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters and no more than 72 bytes.' });
  }
  if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ success: false, message: 'Please enter the 6-digit verification code.' });
  }

  const record = registrationOtps.get(email);
  if (!record || record.expiresAt <= Date.now()) {
    registrationOtps.delete(email);
    return res.status(400).json({ success: false, message: 'Verification code is invalid or expired. Request a new code.' });
  }

  const submittedHash = hashOtp(email, otp);
  if (!timingSafeEqual(record.hash, submittedHash)) {
    record.attempts += 1;
    if (record.attempts >= REGISTRATION_OTP_MAX_ATTEMPTS) registrationOtps.delete(email);
    return res.status(400).json({ success: false, message: 'Verification code is invalid or expired.' });
  }

  try {
    if (await dataService.findAdminByEmail(email)) {
      registrationOtps.delete(email);
      return res.status(409).json({ success: false, message: 'An admin account already exists for this email.' });
    }

    const admin = await dataService.createAdmin({ name: name.trim(), email, password });
    registrationOtps.delete(email);
    const token = createAdminToken(admin);

    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully.',
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (error) {
    if (error.code === 11000 || error.code === 'ADMIN_EXISTS') {
      registrationOtps.delete(email);
      return res.status(409).json({ success: false, message: 'An admin account already exists for this email.' });
    }
    console.error('Admin registration error:', error);
    return res.status(500).json({ success: false, message: 'Could not create the admin account.' });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const admin = await dataService.findAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await dataService.verifyPassword(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = createAdminToken(admin);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const admin = await dataService.findAdminByEmail(req.admin.email);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }

    res.json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin profile.' });
  }
};

