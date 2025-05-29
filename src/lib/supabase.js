import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Set up a default user for development
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

export const getCurrentUser = () => ({
  id: DEMO_USER_ID,
  email: 'demo@example.com',
  first_name: 'Demo',
  last_name: 'User'
});