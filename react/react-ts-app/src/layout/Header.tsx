import { useMemo } from 'react';
import Breadcrumbs from '../shared-components/breadcrumbs/Breadcrumbs';
import { getAuthUserData, unsetAuthUserData } from '../utils/helper';

export default function Header({ breadcrumb = [] as { name: string; link?: string }[] }) {
  const user = useMemo(() => getAuthUserData(), []);
  return (
    <nav className="navbar navbar-top navbar-expand navbar-dark bg-dark-custom border-bottom">
      <div className="container-fluid">
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <Breadcrumbs breadcrumb={breadcrumb} />
          <ul className="navbar-nav align-items-center d-none d-md-flex ml-auto">
            <li className="nav-item dropdown">
              <a className="nav-link pr-0 dropdown-toggle" role="button" data-toggle="dropdown" aria-expanded="false">
                <div className="media align-items-center">
                  <span className="avatar avatar-sm rounded-circle">
                    <img alt="..." src="/assets/img/brand/user.png" />
                  </span>
                  <div className="media-body ml-2 d-none d-lg-block">
                    <span className="mb-0 text-sm font-weight-bold">{user ? `${user.fName || ''} ${user.lName || ''}` : ''}</span>
                  </div>
                </div>
              </a>
              <div className="dropdown-menu dropdown-menu-right">
                <a className="dropdown-item" href="#"><i className="ni ni-single-02" /> <span>My profile</span></a>
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
