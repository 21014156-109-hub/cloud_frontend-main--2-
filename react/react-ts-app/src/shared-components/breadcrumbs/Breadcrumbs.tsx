import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

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

  // Profile pages should show the same label as the header (Profile Settings)
  if (p.startsWith('/profile')) return 'Profile Settings';

  // General Settings
  if (p.startsWith('/device-catalogue')) return 'General Settings';

  // Fallback: Dashboard to avoid wrong labels when not explicitly mapped
  return 'Dashboard';
}

export default function Breadcrumbs() {
  const location = useLocation();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // If this breadcrumb is rendered inside the main content (.main-content or #panel), hide it.
    if (wrapperRef.current) {
      const insidePanel = Boolean(wrapperRef.current.closest('#panel') || wrapperRef.current.closest('.main-content'));
      if (insidePanel) setVisible(false);
    }
  }, []);

  // Prefer a breadcrumb set by pages (window.__BREADCRUMB) when available
  const win = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
  const crumbs = Array.isArray(win.__BREADCRUMB) && win.__BREADCRUMB.length > 0
    ? win.__BREADCRUMB
    : [{ name: mainSectionTitle(location.pathname), link: '/dashboard' }];

  if (!visible) return null;

  return (
    <div ref={wrapperRef} className="header bg-transparent" style={{ width: '100%' }}>
      <div className="container-fluid">
        <div className="header-body">
          <div className="row align-items-center">
            <div className="col-lg-12">
              <nav aria-label="breadcrumb" className="d-none d-md-inline-block">
                <ol className="breadcrumb breadcrumb-links breadcrumb-dark">
                  {crumbs.map((record, idx) => (
                    <li className="breadcrumb-item" key={idx}>
                      {record.name === 'Dashboard' ? (
                        <Link to={record.link || '/dashboard'}>
                          <i className="fas fa-home font-black" />
                        </Link>
                      ) : record.link && record.link !== '' ? (
                        <Link className="font-black" to={record.link}>{record.name}</Link>
                      ) : (
                        <span>{record.name}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
