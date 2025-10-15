import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAuthUserData } from '../utils/helper';
import './layout.css';

type MenuItem = {
  title: string;
  route: string;
  iconClass: string;
  children?: MenuItem[];
  isCollapsed: boolean;
  isHidden: boolean;
};

export default function Sidebar({ pinned, onToggle }: { pinned?: boolean; onToggle?: (open: boolean) => void }) {
  const userData = getAuthUserData();
  const isAdmin = userData ? userData.roleSlug === 'admin' : false;
  const isHiddenForAdmin = !isAdmin;
  // If parent doesn't control, default to false
  const isPinned = !!pinned;
  const location = useLocation();

  const menuItems: MenuItem[] = useMemo(() => ([
    { title: 'Dashboard', route: '/dashboard', isCollapsed: false, isHidden: false, iconClass: 'ni ni-shop text-primary' },
    { title: 'Device Processing', route: '', isCollapsed: true, isHidden: false, iconClass: 'ni ni-collection text-info', children: [
      { title: 'Device Records', route: '/devices/listing', isCollapsed: false, isHidden: false, iconClass: '' },
      { title: 'Tester Reports', route: '/reporting/monthly-report', isCollapsed: false, isHidden: false, iconClass: '' },
    ]},
    { title: 'Configuration Packages', route: '/configuration-package', isCollapsed: false, isHidden: !isHiddenForAdmin, iconClass: 'ni ni-ui-04 text-orange' },
    { title: 'Organization Settings', route: '', isCollapsed: true, isHidden: false, iconClass: 'ni ni-settings text-info', children: [
      { title: 'Configuration Packages', route: '/configuration-package', isCollapsed: false, isHidden: false, iconClass: '' },
      { title: 'Wifi Profiles', route: '/wifi-profiles/listing', isCollapsed: false, isHidden: false, iconClass: '' },
      { title: 'Logos', route: '/logo-setting', isCollapsed: false, isHidden: false, iconClass: '' },
      { title: 'ESN Service Settings', route: '/client-service-settings', isCollapsed: false, isHidden: isHiddenForAdmin, iconClass: '' },
    ]},
    { title: 'User Management', route: '/users', isCollapsed: true, isHidden: false, iconClass: 'ni ni-circle-08 text-success', children: [
      // Clients Management should be visible so users can access listing; keep other children restricted
      { title: 'Clients Management', route: '/users/listing', isCollapsed: false, isHidden: false, iconClass: 'ni ni-single-02 text-orange' },
      { title: 'Warehouse Management', route: '/warehouse/listing', isCollapsed: false, isHidden: false, iconClass: 'ni ni-basket text-success' },
      { title: 'Testers Management', route: '/testers/listing', isCollapsed: false, isHidden: false, iconClass: 'ni ni-badge text-success' },
      { title: 'Add Tester', route: '/testers/add', isCollapsed: false, isHidden: false, iconClass: '' },
      { title: 'Stations Management', route: '/stations/listing', isCollapsed: false, isHidden: false, iconClass: 'ni ni-basket text-success' },
      { title: 'Tester Assignment', route: '/stations-assignment/listing', isCollapsed: false, isHidden: false, iconClass: 'ni ni-basket text-success' },
      { title: 'Assign Stations', route: '/stations-assignment/add', isCollapsed: false, isHidden: false, iconClass: '' },
      { title: 'License Request ', route: `/licenses/${isAdmin ? 'admin-request' : 'request'}`, isCollapsed: false, isHidden: false, iconClass: '' },
    ]},
    { title: 'General Settings', route: '', isCollapsed: true, isHidden: isHiddenForAdmin, iconClass: 'ni ni-app text-primary', children: [
      { title: 'Device Catalogues', route: '/device-catalogue/listing', isCollapsed: false, isHidden: false, iconClass: '' },
      { title: 'Build Management', route: '/build-management/listing', isCollapsed: false, isHidden: isHiddenForAdmin, iconClass: 'ni ni-laptop text-primary' }
    ]},
  ]), [isAdmin, isHiddenForAdmin]);

  const [activePath, setActivePath] = useState(location.pathname);
  useEffect(() => { setActivePath(location.pathname); }, [location.pathname]);

  // Track open/closed state for collapsible menu items in React state.
  // Keys are generated from the item index (and child index for nested items) so
  // they remain stable across renders.
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuItems.forEach((mi, i) => {
      const key = `p-${i}`;
      // open when isCollapsed is explicitly false
      initial[key] = !mi.isCollapsed;
      if (mi.children) {
        mi.children.forEach((c, j) => {
          const childKey = `p-${i}-c-${j}`;
          initial[childKey] = !c.isCollapsed;
        });
      }
    });
    return initial;
  });

  function toggleOpen(key: string) {
    setOpenKeys(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleSidebar() {
    const next = !isPinned;
    onToggle?.(next);
  }

  return (
  <nav className={`sidenav navbar navbar-vertical fixed-left navbar-expand-xs navbar-light bg-white ${isPinned ? 'nav-width' : ''}`} id="sidenav-main">
      <div className="scrollbar-inner">
        <div className="sidenav-header d-flex align-items-center">
          <Link className="navbar-brand" to="/dashboard">
            <img src="/assets/img/brand/logo.png" style={{ maxHeight: '3.5rem' }} className="navbar-brand-img" alt="logo" />
          </Link>
          <div className="ml-auto">
            <div className={`sidenav-toggler d-none d-xl-block ${isPinned ? 'active' : ''}`} onClick={toggleSidebar}>
              <div className="sidenav-toggler-inner">
                <i className="sidenav-toggler-line" />
                <i className="sidenav-toggler-line" />
                <i className="sidenav-toggler-line" />
              </div>
            </div>
          </div>
        </div>
        <div className="navbar-inner">
          <div className="collapse navbar-collapse" id="sidenav-collapse-main">
            <ul className="navbar-nav">
              {menuItems.filter(mi => !mi.isHidden).map((item, idx) => {
                const pKey = `p-${idx}`;
                return (
                <li key={idx} className={`nav-item ${item.route === activePath ? 'active' : ''}`}>
                  {!item.children ? (
                    <Link to={item.route} className={`nav-link ${item.route === activePath ? 'active' : ''}`}>
                      <i className={item.iconClass} />
                      <span className="nav-link-text">{item.title}</span>
                    </Link>
                  ) : (
                    <a
                      className={`nav-link ${item.route === activePath ? 'active' : ''}`}
                      aria-expanded={!!openKeys[pKey]}
                      onClick={() => toggleOpen(pKey)}
                      role="button"
                    >
                      <i className={item.iconClass} />
                      <span className="nav-link-text">{item.title}</span>
                      <span className={`sidebar-caret ${openKeys[pKey] ? 'open' : ''}`}>
                        <i className={`fa fa-chevron-${openKeys[pKey] ? 'down' : 'right'}`} />
                      </span>
                    </a>
                  )}
                  {item.children && (
                    <div className={`collapse ${openKeys[pKey] ? 'show' : ''}`}>
                      <ul className="nav nav-sm flex-column">
                        {item.children.filter(c => !c.isHidden).map((child, cidx) => {
                          const childKey = `p-${idx}-c-${cidx}`;
                          return (
                          <li key={cidx} className={`nav-item ${child.route === activePath ? 'active' : ''}`}>
                            {!child.children ? (
                              <Link to={child.route} className={`nav-link ${child.route === activePath ? 'active' : ''}`}>{child.title}</Link>
                            ) : (
                              <a
                                className={`nav-link ${child.route === activePath ? 'active' : ''}`}
                                aria-expanded={!!openKeys[childKey]}
                                onClick={() => toggleOpen(childKey)}
                                role="button"
                              >
                                <span className="nav-link-text">{child.title}</span>
                              </a>
                            )}
                            {child.children && (
                              <div className={`collapse ${openKeys[childKey] ? 'show' : ''}`}>
                                <ul className="nav nav-sm flex-column">
                                  {child.children.filter(sc => !sc.isHidden).map((subChild, sidx) => (
                                    <li key={sidx} className={`nav-item ${subChild.route === activePath ? 'active' : ''}`}>
                                      <Link to={subChild.route} className={`nav-link ${subChild.route === activePath ? 'active' : ''}`}>{subChild.title}</Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </li>
                        )})}
                      </ul>
                    </div>
                  )}
                </li>
              )})}
              <li className="nav-item">
                <a className="nav-link">
                  <i className="ni ni-laptop text-primary" />
                  <span className="nav-link-text">Build</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
