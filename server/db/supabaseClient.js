import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';

// Ensure WebSocket is available for Supabase Realtime in Node < 22
if (!globalThis.WebSocket) {
  globalThis.WebSocket = WebSocket;
}

dotenv.config();

let rawUrl = (process.env.SUPABASE_URL || '').trim();
// Strip trailing /rest/v1 or trailing slash if user pasted the REST URL
const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('⚠️  WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. Database features will not work.');
  console.warn('   Please add these to your .env file from: https://supabase.com/dashboard/project/_/settings/api');
}

// Supabase client — uses service_role key for full server-side access (bypasses RLS)
export const supabase = (SUPABASE_URL && SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    })
  : null;

export default supabase;
