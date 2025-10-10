import Dashboard from './Dashboard';
import { RouteObject } from 'react-router-dom';

export const dashboardRoutes: RouteObject[] = [
  { path: '/dashboard', element: <Dashboard /> },
];

export default dashboardRoutes;
