import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Quotes from '@/pages/Quotes';
import Sales from '@/pages/Sales';
import Customers from '@/pages/Customers';
import Products from '@/pages/Products';
import Orders from '@/pages/Orders';
import Settings from '@/pages/Settings';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="sales" element={<Sales />} />
          <Route path="customers" element={<Customers />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;