import { useMemo, useState, useEffect, useCallback } from 'react';
import { getAuthUserData } from '../utils/helper';
import DeviceGrades from './device-grades/DeviceGrades';
import TestSuitesTab from './test-suites-tab/TestSuitesTab';
import ClientTestSuitTab from './client-test-suit-tab/ClientTestSuitTab';
import AssignTestSuitesTab from './assign-test-suites-tab/AssignTestSuitesTab';
import '../styles/configuration-package.css';
 

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
  const [events, setEvents] = useState<Array<{ status: string }>>([]);
  const [buttonsEnabled, setButtonsEnabled] = useState<Record<string, boolean>>({ Diagnostic: true, Erase: true, Restore: true, Print: true, PowerOff: true });
  const [settingObject, setSettingObject] = useState<string>('');

  const addEvent = useCallback((name: string) => {
    if (!buttonsEnabled[name]) return;
    setEvents(prev => [...prev, { status: name }]);
    setButtonsEnabled(prev => ({ ...prev, [name]: false }));
  }, [buttonsEnabled]);

  const removeEvent = useCallback((ev: { status: string }) => {
    setEvents(prev => prev.filter(e => e !== ev));
    setButtonsEnabled(prev => ({ ...prev, [ev.status]: true }));
    setSettingObject((s) => (s === ev.status ? '' : s));
  }, []);

  const toggleSettings = useCallback((name: string) => { setSettingObject((s) => (s === name ? '' : name)); }, []);

  const nextTab = useCallback(() => {
    const maxTabIndex = isAdmin ? 1 : 2; // mirrors Angular: admin has fewer client-specific tabs
    const idx = tabs.findIndex(t => t.key === active);
    if (idx < maxTabIndex && idx >= 0) setActive(tabs[idx + 1].key);
  }, [active, isAdmin, tabs]);

  const previousTab = useCallback(() => {
    const idx = tabs.findIndex(t => t.key === active);
    if (idx > 0) setActive(tabs[idx - 1].key);
  }, [active, tabs]);

  // Expose lightweight helpers for parity/debugging (avoids unused variable lint warnings)
  useEffect(() => {
    type Helpers = { [k: string]: unknown } & {
      addEvent?: (n: string) => void;
      removeEvent?: (e: { status: string }) => void;
      toggleSettings?: (s: string) => void;
      nextTab?: () => void;
      previousTab?: () => void;
      events?: Array<{ status: string }>;
      settingObject?: string;
    };
    const w = window as unknown as Record<string, Helpers>;
    w.__configPkgHelpers = {
      addEvent,
      removeEvent,
      toggleSettings,
      nextTab,
      previousTab,
      events,
      settingObject,
    };
    return () => { delete w.__configPkgHelpers; };
  }, [events, settingObject, addEvent, removeEvent, toggleSettings, nextTab, previousTab]);

  useEffect(() => {
    const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
    w.__BREADCRUMB = [{ name: 'Dashboard', link: '/dashboard' }, { name: 'Configuration Package', link: '' }];
    return () => { w.__BREADCRUMB = []; };
  }, []);

  return (
    <div className="container-fluid pt-3">
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



