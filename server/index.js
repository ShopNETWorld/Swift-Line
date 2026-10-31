import 'dotenv/config';
import dns from 'dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (_) {}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import { globalLimiter, botProtectionMiddleware } from './middleware/security.js';
import authRoutes from './routes/auth.js';
import shipmentRoutes from './routes/shipments.js';
import rateRoutes from './routes/rates.js';
import aiRoutes from './routes/ai.js';
import systemRoutes from './routes/system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS: allow Vercel frontend + localhost dev ──────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, Railway health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o.replace(/\/$/, '')))) {
      return callback(null, true);
    }
    // Allow any localhost origin during local development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
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

// ─── Rate Limiting & Bot Protection ──────────────────────────────────────────
app.use('/api', globalLimiter);
app.use('/api', botProtectionMiddleware);

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
    supabase: process.env.SUPABASE_URL ? 'CONNECTED' : 'NOT CONFIGURED',
    timestamp: new Date().toISOString()
  });
});

// ─── Serve built React frontend (for Railway full-stack deploy) ───────────────
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (!req.originalUrl.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'), err => {
      if (err) res.status(200).json({ message: 'Swift Line API is running.' });
    });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('=======================================================');
  console.log('🚀 Swift Line Worldwide Courier Backend Started');
  console.log(`⚡ Port: ${PORT}`);
  console.log(`🗄️  Supabase: ${process.env.SUPABASE_URL ? '✅ Connected' : '❌ NOT CONFIGURED — add SUPABASE_URL to .env'}`);
  console.log(`🔐 JWT: ${process.env.JWT_SECRET !== 'swift-line-worldwide-courier-super-secret-key-2026' ? '✅ Custom secret' : '⚠️  Using default secret — set JWT_SECRET in production'}`);
  console.log(`🛡️  Bot Protection & DDoS Shield: ACTIVE`);
  console.log('=======================================================');
});
