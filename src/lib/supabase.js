import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && 
                            supabaseAnonKey && 
                            !supabaseUrl.includes('placeholder') && 
                            !supabaseAnonKey.includes('placeholder') &&
                            supabaseUrl.startsWith('https://');

let supabase;

if (isSupabaseConfigured) {
  // Use real Supabase client
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase configured and connected');
} else {
  // Create a mock client for development
  console.log('⚠️ Supabase not configured, using demo mode');
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase, isSupabaseConfigured };

// Set up a default user for development when Supabase is not configured
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

export const getCurrentUser = () => ({
  id: DEMO_USER_ID,
  email: 'demo@example.com',
  first_name: 'Demo',
  last_name: 'User'
});