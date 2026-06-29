// src/components/common/GoHome.js — NEW FILE
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const GoHome = () => {
  const { pathname } = useLocation();

  // Don't show on home page itself
  if (pathname === '/') return null;

  return (
    <div style={{
      textAlign: 'center',
      padding: '24px 0 8px',
      borderTop: '1px solid var(--border)',
      marginTop: 32,
    }}>
      <Link to="/" className="btn btn-outline">
        <FiHome size={15} /> Go to Home
      </Link>
    </div>
  );
};

export default GoHome;