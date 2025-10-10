import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthConfig } from '../../utils/helper';

// Simple Auth Guard wrapper for React Router
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const isLogged = AuthConfig.IS_LOGGEDIN === 'true' || window.localStorage.getItem('isLoggedIn') === 'true';
  if (!isLogged) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
