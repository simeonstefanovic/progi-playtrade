import React, { useState, useEffect, useContext } from 'react'; 
import { NavLink, useNavigate } from 'react-router-dom';
import { User, LogIn, LogOut, Menu, X, Bell, Shield } from 'lucide-react'; 
import { AuthContext } from './authcontext.jsx';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const email = localStorage.getItem('email') || localStorage.getItem('yourEmail');

  useEffect(() => {
    if (!isLoggedIn || !email) {
      setPendingCount(0);
      return;
    }
    
    const fetchPendingCount = () => {
      fetch(`/api/trades/pending-count?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.count !== undefined) {
            setPendingCount(data.count);
          }
        })
        .catch(err => console.error('Error fetching pending count:', err));
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, email]);

  useEffect(() => {
    if (!isLoggedIn || !email) {
      setIsAdmin(false);
      return;
    }
    
    fetch('/api/checkAdmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(data => {
        setIsAdmin(data.isAdmin === true);
      })
      .catch(() => setIsAdmin(false));
  }, [isLoggedIn, email]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setPendingCount(0);
    setIsAdmin(false);
    navigate("/");
  };

  const getNavLinkClass = ({ isActive }) => 
    isActive
      ? 'text-brand-900 inline-flex items-center px-1 pt-1 border-b-2 border-brand-700 text-sm font-medium'
      : 'text-brand-700 hover:border-brand-700 hover:text-brand-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium';

  const getMobileNavLinkClass = ({ isActive }) =>
    isActive
      ? 'bg-brand-100 border-brand-700 text-brand-900 block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
      : 'border-transparent text-brand-700 hover:bg-brand-100 hover:border-brand-700 hover:text-brand-900 block pl-3 pr-4 py-2 border-l-4 text-base font-medium';

  return (
    <nav className="bg-brand-200 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <img src="/logo.png" alt="Play Trade" className="h-8 w-8 object-contain" />
            <span className="ml-2 text-xl font-bold text-brand-900">Play Trade</span>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <NavLink to="/" className={getNavLinkClass}>Početna</NavLink>
            <NavLink to="/games" className={getNavLinkClass}>Igre</NavLink>
            <NavLink to="/profile" className={({ isActive }) => `${getNavLinkClass({ isActive })} relative`}>
              Profil
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={getNavLinkClass}>
                <Shield className="w-4 h-4 mr-1" />
                Admin
              </NavLink>
            )}
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {!isLoggedIn ? (
              <>
                <NavLink to="/login" className="text-sm font-medium text-brand-700 hover:text-brand-900">
                  <LogIn className="h-5 w-5 inline-block mr-1" /> Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700"
                >
                  <User className="h-5 w-5 inline-block mr-1" /> Sign Up
                </NavLink>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-brand-700 hover:text-brand-900 flex items-center"
              >
                <LogOut className="h-5 w-5 inline-block mr-1" /> Logout
              </button>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            {pendingCount > 0 && (
              <span className="mr-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
            <button
              type="button"
              className="bg-brand-200 inline-flex items-center justify-center p-2 rounded-md text-brand-700 hover:text-brand-900 hover:bg-brand-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-600"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <NavLink to="/" className={getMobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Početna</NavLink>
            <NavLink to="/games" className={getMobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Igre</NavLink>
            <NavLink to="/profile" className={getMobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
              Profil {pendingCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{pendingCount}</span>}
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={getMobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                <Shield className="w-4 h-4 inline mr-1" /> Admin
              </NavLink>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="space-y-1">
              {!isLoggedIn ? (
                <>
                  <NavLink to="/login" className="block px-4 py-2 text-base font-medium text-brand-700 hover:text-brand-900 hover:bg-brand-100" onClick={() => setIsMobileMenuOpen(false)}>Login</NavLink>
                  <NavLink to="/signup" className="block px-4 py-2 text-base font-medium text-brand-700 hover:text-brand-900 hover:bg-brand-100" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</NavLink>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-brand-700 hover:text-brand-900 hover:bg-brand-100"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
