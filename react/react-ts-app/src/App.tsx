import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './auth/login/Login';
import Dashboard from './dashboard';
import AuthGuard from './core/guard/authGuard';
import AdminGuard from './core/guard/adminGuard';
import BuildManagement from './build-management/listing/BuildManagement';
import Layout from './layout/Layout';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<AuthGuard><Layout><Dashboard /></Layout></AuthGuard>} />
        <Route path="/build-management/listing" element={<AuthGuard><AdminGuard><Layout><BuildManagement /></Layout></AdminGuard></AuthGuard>} />
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
