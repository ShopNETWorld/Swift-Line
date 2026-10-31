import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';
import dns from 'dns';

// Force IPv4 first to prevent 60s+ DNS timeout hangs on Windows/Node fetch
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (_) {}

// Ensure WebSocket is available for Supabase Realtime in Node < 22
if (!globalThis.WebSocket) {
  globalThis.WebSocket = WebSocket;
}

dotenv.config();

// Fallback to active Supabase credentials if environment variables are not injected in Vercel
const DEFAULT_SUPABASE_URL = 'https://sudmxmsitdqqopjenmcn.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1ZG14bXNpdGRxcW9wamVubWNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTAzOTk2OSwiZXhwIjoyMTA0NjE1OTY5fQ.5Kua7LtL1sd-_ZjqM3D7e5QfM6LBBQ-t0mENga1TLgk';

let rawUrl = (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
// Strip trailing /rest/v1 or trailing slash if user pasted the REST URL
export const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY).trim();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('⚠️  WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set.');
}

// Supabase client — uses service_role key for full server-side access (bypasses RLS)
export const supabase = (SUPABASE_URL && SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    })
  : null;

export default supabase;
