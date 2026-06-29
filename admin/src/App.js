// ecommerce-admin/src/App.js — REPLACE existing file
// Settings page REMOVED

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products  from './pages/Products';
import Orders    from './pages/Orders';
import Customers from './pages/Customers';

import './styles/globals.css';

const AdminApp = () => (
  <ProtectedRoute>
    <AdminLayout>
      <Routes>
        <Route path="/"          element={<Dashboard />} />
        <Route path="/products"  element={<Products  />} />
        <Route path="/orders"    element={<Orders    />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </AdminLayout>
  </ProtectedRoute>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#111827',
            color: '#f9fafb',
            fontSize: '14px',
            borderRadius: '10px',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*"     element={<AdminApp />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
