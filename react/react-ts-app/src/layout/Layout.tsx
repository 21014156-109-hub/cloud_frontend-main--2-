import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import './layout.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [toggleSidebar, setToggleSidebar] = useState(false);
  return (
    <>
      <Sidebar onToggle={(open) => setToggleSidebar(open)} />
      <div className={`main-content ${toggleSidebar ? 'full-width' : ''}`} id="panel">
        {children}
        <div className="container-fluid">
          <Footer />
        </div>
      </div>
    </>
  );
}
