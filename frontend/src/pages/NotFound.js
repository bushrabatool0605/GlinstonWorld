import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '100px 24px' }}>
    <div style={{ fontSize: 72, marginBottom: 16 }}>🔍</div>
    <h1 style={{ fontSize: 48, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>404</h1>
    <p style={{ fontSize: 18, color: 'var(--text-secondary)', margin: '12px 0 32px' }}>
      Yeh page nahi mila!
    </p>
    <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
  </div>
);

export default NotFound;
