import { Link, useLocation } from 'react-router-dom';

// Map top-level routes (and some special cases) to their main section name.
function mainSectionTitle(pathname: string): string {
  if (!pathname || pathname === '/' || pathname.startsWith('/dashboard')) return 'Dashboard';

  // Normalize once
  const p = pathname.toLowerCase();

  // Device Processing: includes devices and reporting routes
  if (p.startsWith('/devices') || p.startsWith('/reporting') || p.startsWith('/clouddb')) return 'Device Processing';

  // Configuration & related pages
  if (p.startsWith('/configuration-package') || p.startsWith('/client-test-suit')) return 'Configuration';

  // Build Management
  if (p.startsWith('/build-management')) return 'Build Management';

  // Organization Settings pages
  if (p.startsWith('/wifi-profiles') || p.startsWith('/logo-setting') || p.startsWith('/client-service-settings')) return 'Organization Settings';

  // User Management cluster
  if (p.startsWith('/users') || p.startsWith('/warehouse') || p.startsWith('/testers') || p.startsWith('/stations')) return 'User Management';

  // Licenses pages are part of user/admin management in the app
  if (p.startsWith('/licenses')) return 'User Management';

  // General Settings
  if (p.startsWith('/device-catalogue')) return 'General Settings';

  // Fallback: Dashboard to avoid wrong labels when not explicitly mapped
  return 'Dashboard';
}

export default function Breadcrumbs() {
  const location = useLocation();
  const label = mainSectionTitle(location.pathname);

  return (
    <nav aria-label="breadcrumb">
      <div className="breadcrumb-pill" role="navigation" style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/dashboard" aria-label="Go to Dashboard" style={{ color: 'inherit' }}>
          <i className="fa fa-home" aria-hidden="true" />
        </Link>
        <span className="sep" style={{ margin: '0 8px' }}>-</span>
        <span className="breadcrumb-active" style={{ fontWeight: 600 }}>{label}</span>
      </div>
    </nav>
  );
}
