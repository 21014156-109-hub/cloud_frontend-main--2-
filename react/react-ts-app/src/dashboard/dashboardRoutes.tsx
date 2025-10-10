import Dashboard from './Dashboard';
import type { RouteObject } from 'react-router-dom';

export const dashboardRoutes: RouteObject[] = [
  { path: '/dashboard', element: <Dashboard /> },
];

export default dashboardRoutes;
