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
                            !supabaseUrl.includes('placeholder') && 
                            !supabaseAnonKey.includes('placeholder') &&
                            supabaseUrl.startsWith('https://');

console.log('isSupabaseConfigured:', isSupabaseConfigured);

// Define storage options with a custom key to avoid conflicts
const storageOptions = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
  storageKey: 'promocups-auth-storage',
  debug: false // Disable debug to reduce console noise
};

let supabase;

try {
  if (isSupabaseConfigured) {
    // Use real Supabase client with explicit storage options
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: storageOptions,
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      global: {
        headers: {
          'x-application-name': 'promocups-sales-management'
        }
      }
    });
    console.log('✅ Supabase client created successfully');
  } else {
    // Create a mock client for development
    console.log('⚠️ Supabase not configured, using demo mode');
    supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: storageOptions
    });
  }
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error);
  // Create a minimal client that won't throw errors but won't work either
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signUp: () => Promise.reject(new Error('Supabase client initialization failed')),
      signInWithPassword: () => Promise.reject(new Error('Supabase client initialization failed')),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null })
    }),
    rpc: () => Promise.resolve({ data: null, error: null }),
    removeChannel: () => {},
    channel: () => ({
      on: () => ({ subscribe: () => {} })
    })
  };
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

// Real-time subscription helper
export const subscribeToTable = (tableName, callback, filter = null) => {
  if (!isSupabaseConfigured) {
    console.log(`Demo mode: Would subscribe to ${tableName} changes`);
    return () => {}; // Return empty cleanup function
  }

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
  if (!isSupabaseConfigured) {
    return true; // Demo mode - allow all actions
  }

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
  if (!isSupabaseConfigured) {
    return {
      id: DEMO_USER_ID,
      email: 'demo@example.com',
      first_name: 'Demo',
      last_name: 'User',
      full_name: 'Demo User',
      role: 'super_admin',
      bio: 'Demo user for testing purposes'
    };
  }

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