import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuthUserData, unsetAuthUserData } from '../utils/helper';
import { Breadcrumbs } from '../components';

export default function Header({ onToggle }: { onToggle?: () => void }) {
  const user = useMemo(() => getAuthUserData(), []);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (open && toggleRef.current && !toggleRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);
  function toggleSidebarFromHeader() {
    onToggle?.();
  }
  const location = useLocation();

  function mainSectionTitle(pathname: string): string {
    if (!pathname || pathname === '/' || pathname.startsWith('/dashboard')) return 'Dashboard';
    const p = pathname.toLowerCase();
    if (p.startsWith('/devices') || p.startsWith('/reporting') || p.startsWith('/clouddb')) return 'Device Processing';
    if (p.startsWith('/configuration-package') || p.startsWith('/client-test-suit')) return 'Configuration';
    if (p.startsWith('/build-management')) return 'Build Management';
  if (p.startsWith('/wifi-profiles') || p.startsWith('/logo-setting') || p.startsWith('/client-service-settings')) return 'Organization Settings';
  if (p.startsWith('/users') || p.startsWith('/warehouse') || p.startsWith('/testers') || p.startsWith('/stations')) return 'User Management';
  if (p.startsWith('/licenses')) return 'User Management';
  // Profile pages should show Profile Settings in the header
  if (p.startsWith('/profile')) return 'Profile Settings';
  if (p.startsWith('/device-catalogue')) return 'General Settings';
    return 'Dashboard';
  }
  const headerLabel = mainSectionTitle(location.pathname);
  return (
    <nav className="navbar navbar-top navbar-expand navbar-dark bg-dark-custom border-bottom">
      <div className="container-fluid">
          <div className="d-flex align-items-center">
            {/* Place breadcrumbs directly in the header container so they appear inside the dark header bar */}
            <button className="btn btn-link text-white p-0 mr-3 d-md-none" onClick={toggleSidebarFromHeader} aria-label="Toggle sidebar">
              <i className="ni ni-bullet-list-67" style={{ fontSize: '1.25rem' }} />
            </button>
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate('/dashboard')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/dashboard'); }}
              style={{ display: 'flex', alignItems: 'center', color: '#fff', cursor: 'pointer' }}
              aria-label="Go to Dashboard"
            >
              <i className="fa fa-home" style={{ marginRight: 10 }} aria-hidden="true" />
              <span style={{ fontWeight: 600 }}>{headerLabel}</span>
            </div>
            <div style={{ width: 16 }} />
            <Breadcrumbs />
          </div>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            {/* Header toggler for small screens kept in the same flow */}
            <div style={{ flex: 1 }} />
            <ul className="navbar-nav align-items-center d-none d-md-flex ml-auto">
            <li className={`nav-item dropdown ${open ? 'show' : ''}`} ref={toggleRef}>
              <button
                className={`nav-link pr-0 dropdown-toggle d-flex align-items-center btn btn-link ${open ? 'show' : ''}`}
                aria-expanded={open}
                onClick={(e) => { e.stopPropagation(); setOpen(s => !s); }}
                type="button"
              >
                <div className="media align-items-center">
                  <span className="avatar avatar-sm rounded-circle">
                    <img alt="..." src="/assets/img/brand/user.png" />
                  </span>
                  <div className="media-body ml-2 d-none d-lg-block">
                    <span className="mb-0 text-sm font-weight-bold">{user ? `${user.fName || ''} ${user.lName || ''}` : ''}</span>
                  </div>
                  <i className={`caret-icon fa fa-caret-${open ? 'down' : 'right'} ml-2`} aria-hidden="true" />
                </div>
              </button>
              <div className={`dropdown-menu dropdown-menu-right ${open ? 'show' : ''}`} style={{ position: 'absolute' }}>
                <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); navigate('/profile/update'); }}><i className="ni ni-single-02" /> <span>My profile</span></a>
                <a className="dropdown-item" href="#"><i className="ni ni-settings-gear-65" /> <span>Settings</span></a>
                <a className="dropdown-item" href="#"><i className="ni ni-calendar-grid-58" /> <span>Activity</span></a>
                <a className="dropdown-item" href="#"><i className="ni ni-support-16" /> <span>Support</span></a>
                <div className="dropdown-divider" />
                <a className="dropdown-item" onClick={() => { unsetAuthUserData(); window.location.href = '/'; }}><i className="ni ni-user-run" /> <span>Logout</span></a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
