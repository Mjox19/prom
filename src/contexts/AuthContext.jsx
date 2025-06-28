import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
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
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
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
      await supabase.auth.signOut();
    }
    
    // Optional: Show a notification to the user
    if (typeof window !== 'undefined' && window.alert) {
      alert('You have been logged out due to inactivity.');
    }
  }, []);

  // Extend session (called when user dismisses warning)
  const extendSession = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Set up activity listeners
  useEffect(() => {
    if (!user || !initialized) return;

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start the timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [user, resetInactivityTimer, initialized]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...', { isSupabaseConfigured });
        
        if (!isSupabaseConfigured) {
          console.log('Supabase not configured - using demo mode');
          if (mounted) {
            setUser(null);
            setUserProfile(null);
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        // Check active sessions
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        const currentUser = session?.user ?? null;
        console.log('Initial session check:', { userId: currentUser?.id });
        
        if (mounted) {
          setUser(currentUser);
          
          if (currentUser) {
            await fetchUserProfile(currentUser.id);
          }
          
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Only set up auth listener if Supabase is configured
    let subscription = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          await fetchUserProfile(currentUser.id);
        } else {
          setUserProfile(null);
          // Clear timers when user logs out
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
          }
          setShowInactivityWarning(false);
        }
      });
      
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchUserProfile = async (userId) => {
    if (!isSupabaseConfigured) {
      return {
        id: userId,
        email: 'demo@example.com',
        first_name: 'Demo',
        last_name: 'User',
        full_name: 'Demo User',
        role: 'super_admin',
        bio: 'Demo user for testing purposes'
      };
    }

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
      // Clear inactivity timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      setShowInactivityWarning(false);
      
      if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured');
      }
      return supabase.auth.signOut();
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