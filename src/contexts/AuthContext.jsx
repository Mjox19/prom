import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [configError, setConfigError] = useState(null);
  
  // Auto-logout configuration
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before logout
  
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  // Reset the inactivity timer
  const resetInactivityTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    
    // Hide warning if it's showing
    setShowInactivityWarning(false);
    
    // Only set timer if user is logged in
    if (user) {
      // Set warning timer
      warningTimeoutRef.current = setTimeout(() => {
        setShowInactivityWarning(true);
      }, INACTIVITY_TIMEOUT - WARNING_TIME);
      
      // Set logout timer
      timeoutRef.current = setTimeout(() => {
        handleInactivityLogout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [user]);

  // Handle automatic logout due to inactivity
  const handleInactivityLogout = useCallback(async () => {
    console.log('Auto-logout due to inactivity');
    setShowInactivityWarning(false);
    
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
        // Force page reload to clear any cached state
        window.location.href = '/login';
      } catch (error) {
        console.error('Error during auto-logout:', error);
      }
    }
  }, []);

  // Extend session (called when user dismisses warning)
  const extendSession = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Fetch user profile from Supabase
  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) return null;
    
    if (!isSupabaseConfigured) {
      console.log('Using demo profile for user:', userId);
      const demoProfile = {
        id: userId,
        email: 'demo@example.com',
        first_name: 'Demo',
        last_name: 'User',
        full_name: 'Demo User',
        role: 'super_admin',
        bio: 'Demo user for testing purposes'
      };
      setUserProfile(demoProfile);
      return demoProfile;
    }

    try {
      console.log('Fetching profile for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      console.log('Profile fetched successfully:', profile);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Exception fetching user profile:', error);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    let authListener = null;

    const initAuth = async () => {
      try {
        console.log('Initializing auth state...');
        
        if (!isSupabaseConfigured) {
          console.warn('Supabase not configured, using demo mode');
          if (mounted) {
            setConfigError('Supabase configuration is missing or invalid');
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        // Get current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setConfigError(`Authentication error: ${error.message}`);
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        const session = data?.session;
        const currentUser = session?.user || null;
        
        console.log('Session check result:', { 
          hasSession: !!session, 
          hasUser: !!currentUser 
        });
        
        if (mounted) {
          setUser(currentUser);
          
          if (currentUser) {
            await fetchUserProfile(currentUser.id);
          }
          
          setLoading(false);
          setInitialized(true);
        }

        // Set up auth state change listener
        if (mounted) {
          const { data: authData } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, { hasUser: !!session?.user });
            
            if (!mounted) return;
            
            const user = session?.user || null;
            setUser(user);
            
            if (user) {
              await fetchUserProfile(user.id);
              resetInactivityTimer();
            } else {
              setUserProfile(null);
              // Clear timers when user logs out
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              if (warningTimeoutRef.current) {
                clearTimeout(warningTimeoutRef.current);
                warningTimeoutRef.current = null;
              }
              setShowInactivityWarning(false);
            }
            
            setLoading(false);
          });
          
          authListener = authData.subscription;
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
        if (mounted) {
          setConfigError(`Initialization error: ${error.message}`);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initAuth();

    // Set up activity listeners for inactivity timeout
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
    ];

    const handleActivity = () => {
      if (user) {
        resetInactivityTimer();
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      mounted = false;
      
      // Clean up auth listener
      if (authListener) {
        authListener.unsubscribe();
      }
      
      // Clean up activity listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      // Clean up timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [fetchUserProfile, resetInactivityTimer, user]);

  // Auth context value
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
    signOut: async () => {
      // Clear inactivity timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      setShowInactivityWarning(false);
      
      if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured');
      }
      
      try {
        await supabase.auth.signOut();
        // Force reload to clear any cached state
        window.location.href = '/login';
      } catch (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    },
    updateProfile: async (updates) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured');
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
    initialized,
    configError,
    // Inactivity-related functions and state
    showInactivityWarning,
    extendSession,
    resetInactivityTimer,
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
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};