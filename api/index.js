/**
 * api/index.js — Vercel Serverless Function entry point
 *
 * Vercel routes all /api/* requests here.
 * This file imports and re-uses the existing Express app
 * so zero route code needs to change.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { globalLimiter, botProtectionMiddleware } from '../server/middleware/security.js';
import authRoutes from '../server/routes/auth.js';
import shipmentRoutes from '../server/routes/shipments.js';
import rateRoutes from '../server/routes/rates.js';
import aiRoutes from '../server/routes/ai.js';
import systemRoutes from '../server/routes/system.js';

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman / server-to-server / same-origin
    if (allowedOrigins.some(o => origin.startsWith(o.replace(/\/$/, '')))) {
      return callback(null, true);
    }
    // Allow any Vercel domain or preview deployment
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    
    // In production, fallback to allow origin to avoid breaking custom domains
    return callback(null, true);
  },
  credentials: true
}));

// ─── Security & Parsing ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting & Bot Protection ──────────────────────────────────────────
app.use(globalLimiter);
app.use(botProtectionMiddleware);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/system', systemRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Swift Line Worldwide Courier API',
    supabase: process.env.SUPABASE_URL ? 'CONFIGURED' : 'NOT CONFIGURED',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// Vercel exports the Express app as the default handler
export default app;

