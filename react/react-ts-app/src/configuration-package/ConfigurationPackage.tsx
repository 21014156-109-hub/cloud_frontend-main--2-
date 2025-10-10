import { useMemo, useState } from 'react';
import { getAuthUserData } from '../utils/helper';
import DeviceGrades from './device-grades/DeviceGrades';
import TestSuitesTab from './test-suites-tab/TestSuitesTab';
import ClientTestSuitTab from './client-test-suit-tab/ClientTestSuitTab';
import AssignTestSuitesTab from './assign-test-suites-tab/AssignTestSuitesTab';
import '../styles/configuration-package.css';
import { useEffect } from 'react';

export default function ConfigurationPackage() {
  const user = getAuthUserData();
  const isAdmin = user?.roleSlug === 'admin';
  const tabs = useMemo(() => (
    [
      ...(!isAdmin ? [{ key: 'grades', label: 'Device Grades' as const }] : []),
      { key: 'suites', label: 'Test Suites' as const },
      { key: 'assign', label: 'Assign Test Suites' as const },
    ]
  ), [isAdmin]);
  const [active, setActive] = useState(tabs[0]?.key);

  useEffect(() => {
    const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
    w.__BREADCRUMB = [{ name: 'Dashboard', link: '/dashboard' }, { name: 'Configuration Package', link: '' }];
    return () => { w.__BREADCRUMB = []; };
  }, []);

  return (
    <div className="container-fluid pt-8">
      <div className="card shadow">
        <div className="card-header">
          <ul className="nav nav-tabs">
            {tabs.map(t => (
              <li className="nav-item" key={t.key}>
                <a className={`nav-link ${active === t.key ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setActive(t.key); }}>{t.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-body">
          {active === 'grades' && !isAdmin && <DeviceGrades />}
          {active === 'suites' && (isAdmin ? <TestSuitesTab /> : <ClientTestSuitTab />)}
          {active === 'assign' && (isAdmin ? <ClientTestSuitTab /> : <AssignTestSuitesTab />)}
        </div>
      </div>
    </div>
  );
}

// set breadcrumb for header inside component
// (we set/clear via useEffect to avoid exporting helpers)



