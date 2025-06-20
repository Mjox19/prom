import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      // Use demo user when Supabase is not configured
      console.log('Supabase not configured, using demo user');
      setUser({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'demo@example.com',
        first_name: 'Demo',
        last_name: 'User'
      });
      setLoading(false);
      return;
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    signUp: async (data) => {
      const response = await supabase.auth.signUp(data);
      return response;
    },
    signIn: async (data) => {
      const response = await supabase.auth.signInWithPassword(data);
      return response;
    },
    signOut: () => supabase.auth.signOut(),
    user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};