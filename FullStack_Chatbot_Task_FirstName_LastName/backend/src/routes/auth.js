import crypto from 'node:crypto';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { loginSchema } from '../utils/schemas.js';
import { AppError } from '../utils/AppError.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

// Compare hashes so the comparison is constant-time and length-safe.
const digest = (s) => crypto.createHash('sha256').update(s).digest();
const safeEqual = (a, b) => crypto.timingSafeEqual(digest(a), digest(b));

router.post('/login', loginLimiter, validate(loginSchema), (req, res, next) => {
  const { email, password } = req.body;
  const emailOk = safeEqual(email.trim().toLowerCase(), config.adminEmail.toLowerCase());
  const passOk = safeEqual(password, config.adminPassword);
  if (!(emailOk && passOk)) return next(new AppError(401, 'Incorrect email or password'));

  const token = jwt.sign({ role: 'admin', email: config.adminEmail }, config.jwtSecret, {
    expiresIn: '8h',
    algorithm: 'HS256',
  });
  res.json({ success: true, data: { token, email: config.adminEmail } });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, data: { email: req.admin.email, role: req.admin.role } });
});

export default router;
