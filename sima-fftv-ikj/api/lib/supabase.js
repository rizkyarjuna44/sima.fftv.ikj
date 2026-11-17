import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

export function getSupabase() {
  if (!supabaseInstance) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase env missing');
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase admin env missing');
  return createClient(url, key);
}