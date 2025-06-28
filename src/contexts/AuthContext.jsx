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
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    
    // Hide warning if it's showing
    setShowInactivityWarning(false);
    
    // Only set timer if user is logged in and Supabase is configured
    if (user && isSupabaseConfigured) {
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
    if (!user || !initialized || !isSupabaseConfigured) return;

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

  const fetchUserProfile = async (userId) => {
    if (!isSupabaseConfigured) {
      console.log('📋 Demo mode: Using mock profile data');
      setUserProfile({
        id: userId,
        email: 'demo@example.com',
        first_name: 'Demo',
        last_name: 'User',
        full_name: 'Demo User',
        role: 'super_admin',
        bio: 'Demo user for testing purposes'
      });
      return;
    }

    try {
      console.log('📋 Fetching user profile for:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        return;
      }

      console.log('✅ Profile fetched successfully:', profile);
      setUserProfile(profile);
    } catch (error) {
      console.error('💥 Exception fetching user profile:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...', { isSupabaseConfigured });
        
        if (!isSupabaseConfigured) {
          console.error('❌ Supabase is not configured properly');
          if (mounted) {
            setConfigError('Supabase configuration is missing or invalid. Please check your environment variables.');
            setUser(null);
            setUserProfile(null);
            setLoading(false);
            setInitialized(true); // CRITICAL: Always set initialized to true
          }
          return;
        }

        // Check active sessions
        console.log('🔍 Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) {
            setConfigError(`Authentication error: ${error.message}`);
            setUser(null);
            setUserProfile(null);
            setLoading(false);
            setInitialized(true); // CRITICAL: Always set initialized to true
          }
          return;
        }

        const currentUser = session?.user ?? null;
        console.log('👤 Session check result:', { 
          hasUser: !!currentUser, 
          userId: currentUser?.id 
        });
        
        if (mounted) {
          setUser(currentUser);
          
          if (currentUser) {
            console.log('📋 Fetching user profile...');
            await fetchUserProfile(currentUser.id);
          }
          
          setLoading(false);
          setInitialized(true); // CRITICAL: Always set initialized to true
          console.log('✅ Auth initialization complete');
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error);
        if (mounted) {
          setConfigError(`Initialization error: ${error.message}`);
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          setInitialized(true); // CRITICAL: Always set initialized to true
        }
      }
    };

    // Start initialization immediately
    initializeAuth();

    // Only set up auth listener if Supabase is configured
    let subscription = null;
    if (isSupabaseConfigured) {
      console.log('🔗 Setting up auth state listener...');
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        console.log('🔄 Auth state changed:', event, { 
          hasUser: !!session?.user,
          userId: session?.user?.id 
        });
        
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
  }, []); // Empty dependency array - only run once on mount

  const value = {
    signUp: async (data) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }
      const response = await supabase.auth.signUp(data);
      return response;
    },
    signIn: async (data) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }
      const response = await supabase.auth.signInWithPassword(data);
      return response;
    },
    signOut: async () => {
      // Clear inactivity timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      setShowInactivityWarning(false);
      
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }
      return supabase.auth.signOut();
    },
    updateProfile: async (updates) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
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
        throw new Error('Supabase is not configured. Please check your environment variables.');
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
        throw new Error('Supabase is not configured. Please check your environment variables.');
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