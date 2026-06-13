// ============================================================
// SUPABASE CONFIGURATION — Replace with your project values
// ============================================================

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_PROJECT_REF.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE';

export const SUPABASE_FUNCTIONS_URL =
  process.env.SUPABASE_FUNCTIONS_URL ||
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1';

export const SUPABASE_REALTIME_URL =
  process.env.SUPABASE_REALTIME_URL ||
  'wss://YOUR_PROJECT_REF.supabase.co/realtime/v1';

export const SUPABASE_STORAGE_URL =
  process.env.SUPABASE_STORAGE_URL ||
  'https://YOUR_PROJECT_REF.supabase.co/storage/v1';
