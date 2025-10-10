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

export default function Sidebar({ onToggle }: { onToggle?: (open: boolean) => void }) {
  const userData = getAuthUserData();
  const isAdmin = userData ? userData.roleSlug === 'admin' : false;
  const isHiddenForAdmin = !isAdmin;
  const [toggleSideBar, setToggleSideBar] = useState(false);
  const location = useLocation();

  const menuItems: MenuItem[] = useMemo(() => ([
    { title: 'Dashboard', route: '/dashboard', isCollapsed: false, isHidden: false, iconClass: 'ni ni-shop text-primary' },
    { title: 'Device Processing', route: '', isCollapsed: true, isHidden: false, iconClass: 'ni ni-collection text-info', children: [
      { title: 'Device Records', route: '/devices/listing', isCollapsed: false, isHidden: false, iconClass: '' },
      { title: 'Testers Report', route: '/reporting/monthly-report', isCollapsed: false, isHidden: false, iconClass: '' },
    ]},
    { title: 'Configuration Packages', route: '/configuration-package', isCollapsed: false, isHidden: !isHiddenForAdmin, iconClass: 'ni ni-ui-04 text-orange' },
    { title: 'Organization Settings', route: '', isCollapsed: true, isHidden: false, iconClass: 'ni ni-settings text-info', children: [
      { title: 'Configuration Packages', route: '/configuration-package', isCollapsed: false, isHidden: false, iconClass: '' },
      { title: 'Wifi Profiles', route: '/wifi-profiles/listing', isCollapsed: false, isHidden: false, iconClass: '' },
      { title: 'Logos', route: '/logo-setting', isCollapsed: false, isHidden: false, iconClass: '' },
      { title: 'ESN Service Settings', route: '/client-service-settings', isCollapsed: false, isHidden: isHiddenForAdmin, iconClass: '' },
    ]},
    { title: 'User Management', route: '/users', isCollapsed: true, isHidden: false, iconClass: 'ni ni-circle-08 text-success', children: [
      { title: 'Clients Management', route: '/users/listing', isCollapsed: false, isHidden: isHiddenForAdmin, iconClass: 'ni ni-single-02 text-orange' },
      { title: 'Warehouse Management', route: '/warehouse/listing', isCollapsed: false, isHidden: false, iconClass: 'ni ni-basket text-success' },
      { title: 'Testers Management', route: '/testers/listing', isCollapsed: false, isHidden: isHiddenForAdmin, iconClass: 'ni ni-basket text-success' },
      { title: 'Stations Management', route: '/stations/listing', isCollapsed: false, isHidden: isHiddenForAdmin, iconClass: 'ni ni-basket text-success' },
      { title: 'Tester Assignment', route: '/stations-assignment/listing', isCollapsed: false, isHidden: isHiddenForAdmin, iconClass: 'ni ni-basket text-success' },
      { title: 'License Request ', route: `/licenses/${isAdmin ? 'admin-request' : 'request'}`, isCollapsed: false, isHidden: false, iconClass: '' },
    ]},
    { title: 'General Settings', route: '', isCollapsed: true, isHidden: isHiddenForAdmin, iconClass: 'ni ni-app text-primary', children: [
      { title: 'Device Catalogues', route: '/device-catalogue/listing', isCollapsed: false, isHidden: false, iconClass: '' },
    ]},
    { title: 'Build Management', route: '/build-management/listing', isCollapsed: false, isHidden: isHiddenForAdmin, iconClass: 'ni ni-laptop text-primary' },
  ]), [isAdmin, isHiddenForAdmin]);

  const [activePath, setActivePath] = useState(location.pathname);
  useEffect(() => { setActivePath(location.pathname); }, [location.pathname]);

  function collapseToggle(item: MenuItem) {
    item.isCollapsed = !item.isCollapsed;
  }

  function toggleSidebar() {
    const next = !toggleSideBar;
    setToggleSideBar(next);
    onToggle?.(next);
  }

  return (
    <nav className={`sidenav navbar navbar-vertical fixed-left navbar-expand-xs navbar-light bg-white ${!toggleSideBar ? 'nav-width' : ''}`} id="sidenav-main">
      <div className="scrollbar-inner">
        <div className="sidenav-header d-flex align-items-center">
          <Link className="navbar-brand" to="/dashboard">
            <img src="/assets/img/brand/logo.png" style={{ maxHeight: '3.5rem' }} className="navbar-brand-img" alt="logo" />
          </Link>
          <div className="ml-auto">
            <div className={`sidenav-toggler d-none d-xl-block ${!toggleSideBar ? 'active' : ''}`} onClick={toggleSidebar}>
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
              {menuItems.filter(mi => !mi.isHidden).map((item, idx) => (
                <li key={idx} className={`nav-item ${item.route === activePath ? 'active' : ''}`}>
                  {!item.children ? (
                    <Link to={item.route} className={`nav-link ${item.route === activePath ? 'active' : ''}`}>
                      <i className={item.iconClass} />
                      <span className="nav-link-text">{item.title}</span>
                    </Link>
                  ) : (
                    <a className={`nav-link ${item.route === activePath ? 'active' : ''}`} aria-expanded={!item.isCollapsed} onClick={() => collapseToggle(item)}>
                      <i className={item.iconClass} />
                      <span className="nav-link-text">{item.title}</span>
                    </a>
                  )}
                  {item.children && (
                    <div className={`collapse ${item.isCollapsed ? '' : 'show'}`}>
                      <ul className="nav nav-sm flex-column">
                        {item.children.filter(c => !c.isHidden).map((child, cidx) => (
                          <li key={cidx} className={`nav-item ${child.route === activePath ? 'active' : ''}`}>
                            {!child.children ? (
                              <Link to={child.route} className={`nav-link ${child.route === activePath ? 'active' : ''}`}>{child.title}</Link>
                            ) : (
                              <a className={`nav-link ${child.route === activePath ? 'active' : ''}`} aria-expanded={!child.isCollapsed} onClick={() => collapseToggle(child)}>
                                <span className="nav-link-text">{child.title}</span>
                              </a>
                            )}
                            {child.children && (
                              <div className={`collapse ${child.isCollapsed ? '' : 'show'}`}>
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
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
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
