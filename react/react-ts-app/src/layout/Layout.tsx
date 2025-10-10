import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import './layout.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
  const breadcrumb = w.__BREADCRUMB ?? [];
  return (
    <>
      <Sidebar onToggle={(open) => setToggleSidebar(open)} />
      <div className={`main-content ${toggleSidebar ? 'full-width' : ''}`} id="panel">
        <Header breadcrumb={breadcrumb} />
        {children}
        <div className="container-fluid">
          <Footer />
        </div>
      </div>
    </>
  );
}
