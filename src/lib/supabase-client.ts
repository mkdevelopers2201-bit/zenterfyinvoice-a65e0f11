import { createClient } from '@supabase/supabase-js';

// Replacing these strings with ACTUAL new backend credentials
const supabaseUrl = 'https://gkgzgermnlqtheawyhwr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZ3pnZXJtbmxxdGhlYXd5aHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDQ3NzcsImV4cCI6MjA4NTAyMDc3N30.XMzFBWT2ropJXosmhEkEkZeZ1zSITF2I9szvS9PdeIY';

// Removing the "if" statement that was triggering the error log
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
