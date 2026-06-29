// src/components/layout/Navbar.js — REPLACE

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiShoppingCart, FiLogOut, FiPackage,
  FiHome, FiGrid, FiUser, FiX, FiMenu,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart }          = useCart();
  const navigate          = useNavigate();
  const location          = useLocation();

  const [dropOpen,    setDropOpen]    = useState(false);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const dropRef = useRef();

  useEffect(() => {
    const fn = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  // lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <>
      <nav className="navbar">
        <div className="container nav-inner">

          <Link to="/" className="nav-logo">
            <span>🛍️</span>
            <span>MyStore</span>
          </Link>

          {/* Desktop links */}
          <div className="nav-links">
            <Link to="/"        className="nav-link">Home</Link>
            <Link to="/products" className="nav-link">Products</Link>
          </div>

          <div className="nav-actions">
            {/* Cart */}
            <button className="cart-btn" onClick={() => navigate('/cart')} aria-label="Cart">
              <FiShoppingCart size={19} />
              {cart.totalItems > 0 && (
                <span className="cart-count">{cart.totalItems > 9 ? '9+' : cart.totalItems}</span>
              )}
            </button>

            {/* User dropdown — desktop */}
            {user ? (
              <div className="user-wrap" ref={dropRef}>
                <button className="avatar-btn" onClick={() => setDropOpen(v => !v)} aria-label="Account">
                  <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
                </button>
                {dropOpen && (
                  <div className="dropdown">
                    <div className="drop-header">
                      <p className="drop-name">{user.name}</p>
                      <p className="drop-email">{user.email}</p>
                    </div>
                    <div className="drop-sep" />
                    <button className="drop-item" onClick={() => { navigate('/orders'); setDropOpen(false); }}>
                      <FiPackage size={14} /> My Orders
                    </button>
                    <button className="drop-item danger" onClick={() => { logout(); setDropOpen(false); }}>
                      <FiLogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-btns">
                <Link to="/login"    className="btn btn-outline btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              className="hamburger"
              onClick={() => setDrawerOpen(v => !v)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
            >
              {drawerOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <aside className="drawer" onClick={e => e.stopPropagation()}>

            <div className="drawer-top">
              <span className="drawer-logo">🛍️ MyStore</span>
              <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <FiX size={18} />
              </button>
            </div>

            {user && (
              <div className="drawer-user">
                <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
                <div>
                  <p className="drawer-user-name">{user.name}</p>
                  <p className="drawer-user-email">{user.email}</p>
                </div>
              </div>
            )}

            <nav className="drawer-nav">
              <Link to="/"         className="drawer-link"><FiHome size={17} /> Home</Link>
              <Link to="/products" className="drawer-link"><FiGrid size={17} /> Products</Link>
              <Link to="/cart"     className="drawer-link">
                <FiShoppingCart size={17} /> Cart
                {cart.totalItems > 0 && (
                  <span className="badge badge-info" style={{ marginLeft: 'auto', fontSize: 11 }}>
                    {cart.totalItems}
                  </span>
                )}
              </Link>
              {user ? (
                <Link to="/orders" className="drawer-link"><FiPackage size={17} /> My Orders</Link>
              ) : (
                <Link to="/login"  className="drawer-link"><FiUser size={17} /> Login</Link>
              )}
            </nav>

            <div className="drawer-footer">
              {user ? (
                <button className="btn btn-danger btn-full" onClick={logout}>
                  <FiLogOut size={15} /> Logout
                </button>
              ) : (
                <Link to="/register" className="btn btn-primary btn-full">Create Account</Link>
              )}
            </div>

          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;