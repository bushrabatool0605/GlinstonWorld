import React from 'react';

export const Spinner = ({ dark = false }) => (
  <div className={`spinner ${dark ? 'spinner-dark' : ''}`} />
);

export const PageLoader = () => (
  <div className="page-loader">
    <div className="spinner spinner-dark" style={{ width: 36, height: 36, borderWidth: 3 }} />
  </div>
);
