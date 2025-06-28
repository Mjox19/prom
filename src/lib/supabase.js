import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Configuration Check:');
console.log('VITE_SUPABASE_URL:', supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && 
                            supabaseAnonKey && 
                            supabaseUrl.startsWith('https://') &&
                            supabaseUrl.includes('.supabase.co') &&
                            supabaseAnonKey.length > 50; // JWT tokens are typically longer

console.log('isSupabaseConfigured:', isSupabaseConfigured);

if (!isSupabaseConfigured) {
  console.error('❌ Supabase Configuration Error:');
  if (!supabaseUrl) {
    console.error('- VITE_SUPABASE_URL is missing');
  } else if (!supabaseUrl.startsWith('https://')) {
    console.error('- VITE_SUPABASE_URL should start with https://');
  } else if (!supabaseUrl.includes('.supabase.co')) {
    console.error('- VITE_SUPABASE_URL should contain .supabase.co');
  }
  
  if (!supabaseAnonKey) {
    console.error('- VITE_SUPABASE_ANON_KEY is missing');
  } else if (supabaseAnonKey.length <= 50) {
    console.error('- VITE_SUPABASE_ANON_KEY appears to be invalid (too short)');
  }
  
  console.error('Please check your .env.local file and ensure both variables are set correctly.');
  throw new Error('Supabase is not properly configured. Please check your environment variables.');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

console.log('✅ Supabase client created successfully');

export { supabase, isSupabaseConfigured };

// Real-time subscription helper
export const subscribeToTable = (tableName, callback, filter = null) => {
  const channelName = `${tableName}-changes-${Date.now()}`;
  
  let subscription = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableName,
        ...(filter && { filter })
      },
      callback
    );

  subscription.subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(subscription);
  };
};

// Generate consistent quote number
export const generateQuoteNumber = () => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `QT-${year}-${timestamp}`;
};

// Helper functions for role checking (can be used in components)
export const checkUserRole = async (userId, requiredRole) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) throw error;

    switch (requiredRole) {
      case 'super_admin':
        return data.role === 'super_admin';
      case 'admin':
        return ['admin', 'super_admin'].includes(data.role);
      case 'user':
        return ['user', 'admin', 'super_admin'].includes(data.role);
      default:
        return true;
    }
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

// Get user profile with role
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};