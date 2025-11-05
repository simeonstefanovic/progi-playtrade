import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, User, LogIn, LogOut, Menu } from 'lucide-react';

export default function Navigation() {
  const getNavLinkClass = ({ isActive }) => {
    return isActive
      ? 'text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-indigo-500 text-sm font-medium' // Active styles (with underscore)
      : 'text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium'; // Inactive styles
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Box className="h-8 w-8  text-indigo-600" />
            <span className="ml-2   text-xl font-bold text-gray-900">
              Play Trade
            </span>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <NavLink to="/" className={getNavLinkClass}>
              Početna
            </NavLink>
            <NavLink to="/profile" className={getNavLinkClass}>
              Profil
            </NavLink>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <NavLink
              to="/login"
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <LogIn className="h-5 w-5 inline-block mr-1" />
              Login
            </NavLink>
            <NavLink
              to="/signup"
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <User className="h-5 w-5 inline-block mr-1" />
              Sign Up
            </NavLink>
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
