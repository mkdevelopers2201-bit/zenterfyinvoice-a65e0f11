import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// This will show a specific message in your browser console if the key is missing
if (!supabaseAnonKey || supabaseAnonKey === 'undefined') {
  console.error("Supabase Key is missing from Environment Variables!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
