import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AdminLayout.css';

const AdminLayout = ({ children }) => (
  <div className="admin-layout">
    <Sidebar />
    <div className="admin-main">
      <Topbar />
      <main className="admin-content">
        {children}
      </main>
    </div>
  </div>
);

export default AdminLayout;
