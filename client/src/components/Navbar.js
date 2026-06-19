import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Home, PenSquare, LogIn, UserPlus, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Use AuthContext as single source of truth; also verify token exists
  const hasValidToken = (() => {
    if (!user) return false;
    try {
      return Boolean(localStorage.getItem('token'));
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return null;

  const isAuthenticated = Boolean(user) && hasValidToken;
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className={`navbar-glass ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            Blogora
          </Link>

          <ul className="nav-links">
            <li>
              <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Home
              </NavLink>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <NavLink to="/create" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Create
                  </NavLink>
                </li>
                <li className="nav-user-badge">
                  <User size={14} />
                  {user.username || user.email}
                </li>
                <li>
                  <button onClick={logout} className="nav-btn">
                    <LogOut size={14} />
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink to="/register" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Join
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/signin" className="nav-btn nav-btn-primary">
                    <LogIn size={14} />
                    Sign In
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <ul className="mobile-menu-list">
          <li className="mobile-menu-item">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'mobile-menu-link active' : 'mobile-menu-link'} onClick={closeMenu}>
              <Home size={18} />
              Home
            </NavLink>
          </li>
          {isAuthenticated ? (
            <>
              <li className="mobile-menu-item">
                <NavLink to="/create" className={({ isActive }) => isActive ? 'mobile-menu-link active' : 'mobile-menu-link'} onClick={closeMenu}>
                  <PenSquare size={18} />
                  Create Post
                </NavLink>
              </li>
              <li className="mobile-menu-divider" />
              <li className="mobile-menu-item">
                <div style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} />
                  {user.username || user.email}
                </div>
              </li>
              <li className="mobile-menu-item">
                <button onClick={() => { logout(); closeMenu(); }} className="mobile-menu-link" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#ef4444' }}>
                  <LogOut size={18} />
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="mobile-menu-item">
                <NavLink to="/register" className={({ isActive }) => isActive ? 'mobile-menu-link active' : 'mobile-menu-link'} onClick={closeMenu}>
                  <UserPlus size={18} />
                  Join
                </NavLink>
              </li>
              <li className="mobile-menu-item">
                <NavLink to="/signin" className={({ isActive }) => isActive ? 'mobile-menu-link active' : 'mobile-menu-link'} onClick={closeMenu}>
                  <LogIn size={18} />
                  Sign In
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </>
  );
}

export default Navbar;
