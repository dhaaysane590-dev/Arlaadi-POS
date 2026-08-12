import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL);
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY);

  if (!url || !key) {
    return null;
  }

  supabaseClient = createClient(url, key);
  return supabaseClient;
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}
