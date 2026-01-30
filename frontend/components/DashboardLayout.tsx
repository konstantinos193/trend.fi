'use client';

import { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboard">
      <Navbar />
      <div className="dashboard__body">
        <Sidebar />
        <main className="dashboard__main">
          <div className="dashboard__content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
