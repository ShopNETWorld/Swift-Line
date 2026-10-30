/**
 * api/index.js — Vercel Serverless Function entry point
 *
 * Handles all /api/* requests on Vercel serverless.
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
import supabase, { SUPABASE_URL } from '../server/db/supabaseClient.js';

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
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o.replace(/\/$/, '')))) {
      return callback(null, true);
    }
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    return callback(null, true);
  },
  credentials: true
}));

// ─── Security & Parsing ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Vercel URL Path Normalizer ───────────────────────────────────────────────
// In Vercel serverless functions, rewrites can pass paths like:
// /api/auth/login, /auth/login, /api/index.js/auth/login, or /api/index/auth/login
app.use((req, res, next) => {
  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '') || '/';
  } else if (req.url.startsWith('/api/index')) {
    req.url = req.url.replace('/api/index', '') || '/';
  }
  next();
});

// ─── Rate Limiting & Bot Protection ──────────────────────────────────────────
app.use(globalLimiter);
app.use(botProtectionMiddleware);

// ─── API Routes (Mounted on both /api/path and /path for Vercel rewrite compatibility) ──
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/shipments', shipmentRoutes);
app.use('/shipments', shipmentRoutes);

app.use('/api/rates', rateRoutes);
app.use('/rates', rateRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

app.use('/api/system', systemRoutes);
app.use('/system', systemRoutes);

// ─── Health & Supabase Diagnostic Check ───────────────────────────────────────
app.get(['/api/health', '/health'], async (req, res) => {
  let dbStatus = 'DISCONNECTED';
  let dbError = null;
  let userCount = 0;

  try {
    if (supabase) {
      const { data, error } = await supabase.from('users').select('id');
      if (error) {
        dbError = error.message;
      } else {
        dbStatus = 'CONNECTED';
        userCount = data?.length || 0;
      }
    } else {
      dbError = 'Supabase client is null (missing credentials)';
    }
  } catch (err) {
    dbError = err.message;
  }

  res.json({
    status: 'ONLINE',
    service: 'Swift Line Worldwide Courier API',
    supabase_url: SUPABASE_URL || 'NOT_SET',
    supabase_connection: dbStatus,
    supabase_error: dbError,
    users_found_in_supabase: userCount,
    timestamp: new Date().toISOString()
  });
});

export default app;
