import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Quotes from '@/pages/Quotes';
import Sales from '@/pages/Sales';
import Customers from '@/pages/Customers';
import Products from '@/pages/Products';
import Orders from '@/pages/Orders';
import EmailTemplates from '@/pages/EmailTemplates';
import Settings from '@/pages/Settings';
import Admin from '@/pages/Admin';
import Login from '@/pages/Login';
import AuthGuard from '@/components/AuthGuard';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { deliveryScheduler } from '@/lib/deliveryScheduler';
import { notificationService } from '@/lib/notificationService';

function App() {
  useEffect(() => {
    // Request notification permission when app loads
    notificationService.requestNotificationPermission();
    
    // Start the delivery scheduler
    deliveryScheduler.start();
    
    // Cleanup on unmount
    return () => {
      deliveryScheduler.stop();
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <AuthGuard>
                <Layout />
              </AuthGuard>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="sales" element={<Sales />} />
            <Route path="customers" element={<Customers />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="email-templates" element={<EmailTemplates />} />
            <Route path="settings" element={<Settings />} />
            <Route 
              path="admin" 
              element={
                <AuthGuard requiredRole="super_admin" fallbackPath="/">
                  <Admin />
                </AuthGuard>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;