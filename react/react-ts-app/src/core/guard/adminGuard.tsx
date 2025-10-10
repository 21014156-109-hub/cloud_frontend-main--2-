import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthUserData } from '../../utils/helper';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = getAuthUserData();
  if (!user || user.roleSlug !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
