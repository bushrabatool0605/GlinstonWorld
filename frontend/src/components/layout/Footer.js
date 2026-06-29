import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container footer-inner">
      <div className="footer-brand">
        <span className="footer-logo">🛍️ GlistonWorld</span>
        <p>Pakistan ka best online store.</p>
      </div>
      <div className="footer-links">
        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Sign Up</Link>
          <Link to="/orders">My Orders</Link>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <a href="mailto:support@GlistonWorld.pk">support@GlistonWorld.pk</a>
        </div>
      </div>
    </div>
    <div className="footer-bottom">
      <p>© {new Date().getFullYear()} GlistonWorld. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
