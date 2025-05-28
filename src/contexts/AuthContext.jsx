import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const ensureProfile = async (user) => {
    if (!user) return;
    
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create new profile if none exists
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email,
            first_name: '',  // Required field, temporary value
            last_name: '',   // Required field, temporary value
            role: 'user'     // Default role as per schema
          }]);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        ensureProfile(currentUser);
      }
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await ensureProfile(currentUser);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    signUp: async (data) => {
      const response = await supabase.auth.signUp(data);
      if (response.data.user) {
        await ensureProfile(response.data.user);
      }
      return response;
    },
    signIn: async (data) => {
      const response = await supabase.auth.signInWithPassword(data);
      if (response.data.user) {
        await ensureProfile(response.data.user);
      }
      return response;
    },
    signOut: () => supabase.auth.signOut(),
    user,
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