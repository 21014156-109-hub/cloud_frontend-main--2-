import type { RouteObject } from 'react-router-dom';
import Login from './login/Login';

// Example React Router routes for auth module
export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
];

export default authRoutes;
