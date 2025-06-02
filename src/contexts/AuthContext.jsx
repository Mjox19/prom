// Current content of src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const ensureProfile = async (user) => {
    if (!user) return;

    try {
      // Check if profile record exists - using maybeSingle() instead of single()
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Create new profile record if none exists
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email,
            first_name: user.email.split('@')[0], // Default first name from email
            last_name: '', // Empty last name
            avatar_url: null,
            bio: '', // Required but can be empty
            role: 'user' // Default role
          }]);

        if (insertError) {
          console.error('Error creating profile record:', insertError);
          // If profile creation fails, sign out the user
          await supabase.auth.signOut();
          setUser(null);
          return;
        }

        // --- REMOVE THIS BLOCK: Notification preferences are handled by DB trigger ---
        // Create default notification preferences using service role client
        // const { data: { session } } = await supabase.auth.getSession();
        // if (session?.access_token) {
        //   const { error: prefError } = await supabase
        //     .from('notification_preferences')
        //     .insert([{
        //       user_id: user.id,
        //       // Default values are handled by the database
        //     }], {
        //       headers: {
        //         Authorization: `Bearer ${session.access_token}`
        //       }
        //     });

        //   if (prefError) {
        //     console.error('Error creating notification preferences:', prefError);
        //   }
        // }
        // --- END REMOVAL BLOCK ---

      }
    } catch (error) {
      console.error('Error ensuring profile record exists:', error);
      // If there's an error, sign out the user
      await supabase.auth.signOut();
      setUser(null);
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
      setLoading(false);
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