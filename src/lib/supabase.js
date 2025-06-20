import { createClient } from '@supabase/supabase-js';

// Use placeholder values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Set up a default user for development when Supabase is not configured
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

export const getCurrentUser = () => ({
  id: DEMO_USER_ID,
  email: 'demo@example.com',
  first_name: 'Demo',
  last_name: 'User'
});