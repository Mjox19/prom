import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, initialized } = useAuth();

  // Redirect if already authenticated and auth is initialized
  useEffect(() => {
    if (initialized && user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, initialized, navigate, location]);

  // Don't render login form if we're still checking auth or user is already logged in
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

  if (user) {
    return null; // Will redirect via useEffect
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    if (!isSupabaseConfigured) {
      toast({
        title: "Demo Mode",
        description: "Supabase is not configured. Please set up your environment variables.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;

      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    if (!isSupabaseConfigured) {
      toast({
        title: "Demo Mode",
        description: "Supabase is not configured. Please set up your environment variables.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: email.split('@')[0],
            last_name: '',
          }
        }
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Account created successfully. You can now sign in.",
      });
    } catch (error) {
      console.error('Signup error:', error);
      
      // Check for the specific "User already registered" error
      if (error.message === 'User already registered') {
        toast({
          title: "Account Exists",
          description: "This email is already registered. Please sign in instead, or use a different email address.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Signup Failed",
          description: error.message || "Failed to create account. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive"
      });
      return;
    }

    if (!isSupabaseConfigured) {
      toast({
        title: "Demo Mode",
        description: "Supabase is not configured. Please set up your environment variables.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (error) throw error;
      
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo promocups Normal.png" 
              alt="Promocups" 
              className="h-12 w-auto"
            />
          </div>
          <p className="text-gray-600">Sales Management System</p>
        </div>
        
        <Card className="border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Welcome Back</CardTitle>
            <CardDescription>
              {!isSupabaseConfigured ? (
                <span className="text-amber-600">Demo Mode - Supabase not configured</span>
              ) : (
                "Sign in to your account or create a new one"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                  className="focus:border-orange-300 focus:ring-orange-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="focus:border-orange-300 focus:ring-orange-200"
                />
                {isSupabaseConfigured && (
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm text-orange-600 hover:text-orange-700"
                    onClick={handlePasswordReset}
                    disabled={loading}
                  >
                    Forgot password?
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleLogin}
              disabled={loading || !isSupabaseConfigured}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Please wait...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
              onClick={handleSignUp}
              disabled={loading || !isSupabaseConfigured}
            >
              Create Account
            </Button>
            {!isSupabaseConfigured && (
              <p className="text-xs text-center text-gray-500 mt-2">
                To enable authentication, please configure your Supabase environment variables.
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;