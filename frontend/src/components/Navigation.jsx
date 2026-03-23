import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function NavItem({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`nav-link ${active ? 'nav-link-active' : ''}`}
    >
      {label}
    </Link>
  );
}

export default function Navigation({ currentUser, onLogout }) {
  const location = useLocation();
  const role = (currentUser?.role || '').toUpperCase();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser && location.pathname === '/auth') {
    return null;
  }

  return (
    <nav className="app-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-4">
          <Link to={role === 'TRAINER' ? '/trainer/members' : '/'} className="brand-title">
            FlexiPulse
            <span className="brand-subtitle">fit intelligence</span>
          </Link>
          <button
            type="button"
            className="menu-btn md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? 'Close' : 'Menu'}
          </button>
          <div className={`nav-group ${mobileOpen ? 'nav-group-open' : ''}`}>
            <NavItem to="/" label="Dashboard" active={location.pathname === '/'} />
            <NavItem to="/booking" label="Appointments" active={location.pathname === '/booking'} />
            <NavItem to="/diet" label="AI Diet" active={location.pathname === '/diet'} />
            {role === 'TRAINER' && (
              <NavItem
                to="/trainer/members"
                label="Manage Members"
                active={location.pathname === '/trainer/members'}
              />
            )}
            <span className="role-pill">{role || 'MEMBER'}</span>
            <button type="button" className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
