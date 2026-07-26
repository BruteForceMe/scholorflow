import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FiSearch, FiBell, FiSettings, FiSun, FiMoon } from 'react-icons/fi';

export default function Header() {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks, notes, workspaces..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="header-right">
        <button
          className="header-btn theme-toggle-btn"
          onClick={toggleTheme}
          title={state.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          id="theme-toggle"
        >
          <span className={`theme-icon ${state.theme === 'dark' ? 'show' : 'hide'}`}>
            <FiSun />
          </span>
          <span className={`theme-icon ${state.theme === 'light' ? 'show' : 'hide'}`}>
            <FiMoon />
          </span>
        </button>
        <button className="header-btn" title="Notifications">
          <FiBell />
          <span className="notification-dot"></span>
        </button>
        <button className="header-btn" title="Settings">
          <FiSettings />
        </button>
      </div>
    </header>
  );
}
