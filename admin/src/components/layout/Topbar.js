// ecommerce-admin/src/components/layout/Topbar.js — REPLACE existing file
// Settings removed from PAGE_TITLES

import React from 'react';
import { useLocation } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import './Topbar.css';

const PAGE_TITLES = {
  '/':          'Dashboard',
  '/products':  'Products',
  '/orders':    'Orders',
  '/customers': 'Customers',
};

const Topbar = () => {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Admin Panel';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-right">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline btn-sm view-store-btn"
        >
          <FiExternalLink size={14} /> View Store
        </a>
      </div>
    </header>
  );
};

export default Topbar;
