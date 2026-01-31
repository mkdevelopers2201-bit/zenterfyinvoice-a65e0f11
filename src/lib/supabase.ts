import { createClient } from '@supabase/supabase-client';

// Use import.meta.env for Vite projects
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase Environment Variables. Check Vercel Settings.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
