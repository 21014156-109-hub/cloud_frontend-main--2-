import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthConfig, checkPermission } from '../../utils/helper';

// Simple Auth Guard wrapper for React Router
export default function AuthGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isLogged = AuthConfig.IS_LOGGEDIN === 'true' || window.localStorage.getItem('isLoggedIn') === 'true';
  if (!isLogged) {
    // Align with Angular: send unauthenticated users to /login
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  // Placeholder permission check parity with Angular; currently always true
  const allowed = checkPermission(location.pathname);
  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
