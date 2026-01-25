import { createClient } from '@supabase/supabase-js';

// These are your project-specific details
const supabaseUrl = 'https://xvlnlertpfdkgvitlfsc.supabase.co';
const supabaseAnonKey = 'your-actual-anon-key-here'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
