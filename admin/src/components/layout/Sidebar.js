import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers,
  FiLogOut, FiX, FiChevronRight, FiMenu,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/',          icon: <FiGrid size={18} />,        label: 'Dashboard'  },
  { to: '/products',  icon: <FiPackage size={18} />,     label: 'Products'   },
  { to: '/orders',    icon: <FiShoppingBag size={18} />, label: 'Orders'     },
  { to: '/customers', icon: <FiUsers size={18} />,       label: 'Customers'  },
];

const Sidebar = () => {
  const { admin, logout }             = useAuth();
  const [collapsed, setCollapsed]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);  // ← NEW

  return (
    <>
      {/* ── Mobile hamburger button ── */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
      >
        <FiMenu size={22} />
      </button>

      {/* ── Overlay ── */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          {!collapsed && (
            <div className="sidebar-logo">
              <span className="logo-icon">🛍️</span>
              <span className="logo-text">Admin Panel</span>
            </div>
          )}
          <button className="sidebar-toggle btn-icon" onClick={() => {
            setCollapsed(c => !c);
            setMobileOpen(false);  // ← mobile pe band karo
          }}>
            {collapsed ? <FiChevronRight size={16} /> : <FiX size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
              onClick={() => setMobileOpen(false)}  // ← nav click pe band
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && admin && (
            <div className="admin-info">
              <div className="admin-avatar">{admin.name?.[0]?.toUpperCase()}</div>
              <div className="admin-details">
                <p className="admin-name">{admin.name}</p>
                <p className="admin-role">Administrator</p>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={logout} title="Logout">
            <FiLogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;