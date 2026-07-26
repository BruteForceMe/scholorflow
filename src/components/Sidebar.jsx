import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  FiHome,
  FiCheckSquare,
  FiFileText,
  FiUsers,
  FiBarChart2,
  FiCalendar,
  FiZap,
  FiTarget,
  FiLogOut,
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
} from 'react-icons/fi';

const navItems = [
  { path: '/', label: 'Dashboard', icon: <FiHome /> },
  { path: '/tasks', label: 'Tasks', icon: <FiCheckSquare /> },
  { path: '/focus', label: 'Focus Mode', icon: <FiTarget /> },
  { path: '/notes', label: 'Notes', icon: <FiFileText /> },
  { path: '/workspaces', label: 'Workspaces', icon: <FiUsers /> },
  { path: '/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
  { path: '/schedule', label: 'Smart Schedule', icon: <FiCalendar /> },
  { path: '/insights', label: 'Focus Insights', icon: <FiZap /> },
];

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 200,
          display: 'none',
          width: 40,
          height: 40,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)',
          fontSize: '1.2rem',
        }}
      >
        {mobileOpen ? <FiX /> : <FiMenu />}
      </button>

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">📚</div>
          <h2>ScholorFlow</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
              end={item.path === '/'}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>




        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {state.currentUser?.avatar || '🧑‍🎓'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{state.currentUser?.name}</div>
            <div className="sidebar-user-email">{state.currentUser?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-icon"
            style={{ color: 'var(--text-muted)' }}
            title="Logout"
          >
            <FiLogOut />
          </button>
        </div>
      </aside>
    </>
  );
}
