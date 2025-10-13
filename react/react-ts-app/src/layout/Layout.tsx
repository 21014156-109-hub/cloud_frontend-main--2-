import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import './layout.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  // Persisted pinned state — user wants sidebar to stay open across reloads
  const [pinned, setPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sidebarPinned') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sidebarPinned', pinned ? 'true' : 'false');
    } catch {
      // ignore
    }
  }, [pinned]);

  // Keep body class in sync for any vendor CSS that depends on it
  useEffect(() => {
    if (pinned) document.body.classList.add('g-sidenav-pinned');
    else document.body.classList.remove('g-sidenav-pinned');
  }, [pinned]);


  return (
    <>
      <Sidebar pinned={pinned} onToggle={(next) => setPinned(next)} />
      <div className={`main-content ${pinned ? 'full-width' : ''}`} id="panel">
  <Header onToggle={() => setPinned((s) => !s)} />
        {children}
        <div className="container-fluid">
          <Footer />
        </div>
      </div>
    </>
  );
}
