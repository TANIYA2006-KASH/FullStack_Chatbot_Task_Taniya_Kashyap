import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { query } from './db.js';
import authRoutes from './routes/auth.js';
import enquiryRoutes from './routes/enquiries.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
      cb(null, false); // browser blocks the response; no details leaked
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  }),
);
app.use(express.json({ limit: '10kb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please slow down.' },
  }),
);

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ success: true, status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ success: false, status: 'degraded', database: 'unavailable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/enquiries', enquiryRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
