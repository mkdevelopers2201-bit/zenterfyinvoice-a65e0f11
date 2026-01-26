import { createClient } from '@supabase/supabase-js';

// This looks at Lovable's Environment Variables first
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xvlnlertpfdkgvitlfsc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2bG5sZXJ0cGZka2d2aXRsZnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMjk4NjYsImV4cCI6MjA4NDkwNTg2Nn0.y0YpOijw8yPQsuKj6zy8xaxlKHwhSwf7Y1Fm-EI-QVw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
