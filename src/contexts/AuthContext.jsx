import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Use demo user when Supabase is not configured
      console.log('Using demo user - Supabase not configured');
      const demoUser = {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'demo@example.com',
        first_name: 'Demo',
        last_name: 'User'
      };
      const demoProfile = {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'demo@example.com',
        first_name: 'Demo',
        last_name: 'User',
        full_name: 'Demo User',
        role: 'super_admin', // Demo user is super admin
        bio: 'Demo user for testing purposes'
      };
      setUser(demoUser);
      setUserProfile(demoProfile);
      setLoading(false);
      return;
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchUserProfile(currentUser.id);
      }
      
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchUserProfile(currentUser.id);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const value = {
    signUp: async (data) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured');
      }
      const response = await supabase.auth.signUp(data);
      return response;
    },
    signIn: async (data) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured');
      }
      const response = await supabase.auth.signInWithPassword(data);
      return response;
    },
    signOut: () => {
      if (!isSupabaseConfigured) {
        return Promise.resolve();
      }
      return supabase.auth.signOut();
    },
    updateProfile: async (updates) => {
      if (!isSupabaseConfigured) {
        // Update demo profile
        setUserProfile(prev => ({ ...prev, ...updates }));
        return { data: userProfile, error: null };
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (error) throw error;
        
        setUserProfile(data);
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    changeUserRole: async (targetUserId, newRole) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured');
      }
      
      try {
        const { data, error } = await supabase.rpc('change_user_role', {
          target_user_id: targetUserId,
          new_role: newRole
        });

        if (error) throw error;
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    promoteToSuperAdmin: async (targetUserId) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured');
      }
      
      try {
        const { data, error } = await supabase.rpc('promote_to_super_admin', {
          target_user_id: targetUserId
        });

        if (error) throw error;
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    user,
    userProfile,
    loading,
    // Helper functions for role checking
    isSuperAdmin: () => userProfile?.role === 'super_admin',
    isAdmin: () => userProfile?.role === 'admin' || userProfile?.role === 'super_admin',
    isUser: () => userProfile?.role === 'user',
    hasRole: (role) => userProfile?.role === role,
    canManageUsers: () => userProfile?.role === 'super_admin',
    canManageProducts: () => userProfile?.role === 'admin' || userProfile?.role === 'super_admin'
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