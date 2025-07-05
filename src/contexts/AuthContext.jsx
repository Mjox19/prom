import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [configError, setConfigError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Auto-logout configuration
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before logout
  
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const initializationRef = useRef(false);
  const mountedRef = useRef(true);

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
    if (!userId || !mountedRef.current) return null;
    
    console.log('📋 Fetching user profile for:', userId);
    
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
      if (mountedRef.current) {
        setUserProfile(demoProfile);
      }
      return demoProfile;
    }

    try {
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
      if (mountedRef.current) {
        setUserProfile(profile);
      }
      return profile;
    } catch (error) {
      console.error('Exception fetching user profile:', error);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    mountedRef.current = true;
    console.log('🔄 Auth context initializing or refreshing...', refreshTrigger);
    
    const initAuth = async () => {
      // Prevent multiple initializations
      if (initializationRef.current) {
        console.log('🔄 Auth already initializing, skipping...');
        return;
      }
      
      initializationRef.current = true;
      
      try {
        console.log('🔄 Initializing auth...', { isSupabaseConfigured });
        
        if (!isSupabaseConfigured && mountedRef.current) {
          console.warn('⚠️ Supabase not configured, using demo mode');
          if (mountedRef.current) {
            setConfigError('Supabase configuration is missing or invalid');
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        // Get current session without triggering auth state changes
        console.log('🔍 Checking for existing session...');
        const { data, error } = await supabase.auth.getSession();
        console.log('Session check result:', data?.session ? 'Found session' : 'No session', error ? `Error: ${error.message}` : '');
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (mountedRef.current) {
            setConfigError(`Authentication error: ${error.message}`);
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        const session = data?.session;
        const currentUser = session?.user || null;
        
        if (mountedRef.current && currentUser) {
          console.log('✅ Found existing session for user:', currentUser.id);
          setUser(currentUser);
          await fetchUserProfile(currentUser.id);
          resetInactivityTimer();
        } else if (mountedRef.current) {
          console.log('ℹ️ No existing session found');
          setUser(null);
          setUserProfile(null);
        }
        
        if (mountedRef.current) {
          setLoading(false);
          setInitialized(true);
        }

        // Set up auth state change listener AFTER initial state is set
        if (mountedRef.current) {
          console.log('🔗 Setting up auth state listener...');
          const { data: authData } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔄 Auth state changed:', event, { hasSession: !!session });
            
            if (!mountedRef.current) return;
            
            const user = session?.user || null;
            
            // Batch state updates to prevent multiple re-renders
            if (user) {
              setUser(user);
              await fetchUserProfile(user.id);
              resetInactivityTimer();
            } else {
              setUser(null);
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
          });
          
          // Store the unsubscribe function
          return authData.subscription;
        }
      } catch (error) {
        console.error('❌ Error in auth initialization:', error);
          if (currentUser) {
            setConfigError(`Initialization error: ${error.message}`);
            setLoading(false);
            setInitialized(true);
          }
      }
    };

    const authSubscription = initAuth();

    // Set up activity listeners for inactivity timeout
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
    ];

    const handleActivity = () => {
      if (user && mountedRef.current) {
        resetInactivityTimer();
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      mountedRef.current = false;
      
      // Clean up auth listener if it exists
      if (authSubscription && typeof authSubscription.then === 'function') {
        authSubscription.then(subscription => {
          if (subscription && subscription.unsubscribe) {
            subscription.unsubscribe();
          }
        });
      }
      
      // Clean up activity listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      // Clean up any existing timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [refreshTrigger]); // Run when refreshTrigger changes

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
        return await supabase.auth.signOut();
      } catch (error) {
        // If the session doesn't exist on the server, treat it as a successful logout
        if (error.message?.includes('Session from session_id claim in JWT does not exist') || 
            error.message?.includes('Invalid session')) {
          console.log('Session already invalid, treating as successful logout');
          return { error: null };
        }
        // Re-throw other errors to ensure they're still handled properly
        throw error;
      }
    },
    refreshAuth: () => {
      // Trigger a refresh of the auth state
      console.log('🔄 Manually refreshing auth state');
      setRefreshTrigger(prev => prev + 1);
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
    isUser: () => Boolean(userProfile?.role),
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