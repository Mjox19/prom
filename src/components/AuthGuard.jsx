import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthGuard = ({ children, requiredRole = null, fallbackPath = '/login' }) => {
  const { user, userProfile, loading, initialized } = useAuth();
  const location = useLocation();

  console.log('AuthGuard state:', { 
    hasUser: !!user, 
    loading, 
    initialized, 
    userRole: userProfile?.role 
  });

  // Show loading only if we haven't initialized yet
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user and we've finished initializing, redirect to login
  if (!user) {
    console.log('No user found, redirecting to login');
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && userProfile) {
    const hasRequiredRole = () => {
      switch (requiredRole) {
        case 'super_admin':
          return userProfile.role === 'super_admin';
        case 'admin':
          return userProfile.role === 'admin' || userProfile.role === 'super_admin';
        case 'user':
          return ['user', 'admin', 'super_admin'].includes(userProfile.role);
        default:
          return true;
      }
    };

    if (!hasRequiredRole()) {
      console.log('User does not have required role:', requiredRole);
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return children;
};

export default AuthGuard;