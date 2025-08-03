import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) return null;
  const { user, logout } = authContext;

  const navLinkClasses = "text-light-subtle dark:text-dark-subtle hover:text-brand-purple dark:hover:text-brand-purple transition-colors font-medium";
  const activeLinkClasses = "text-brand-purple dark:text-brand-purple";

  return (
    <header className="sticky top-0 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm z-50">
      <div className="bg-brand-yellow/80 text-center py-1 px-4">
        <p className="text-xs font-semibold text-black">
          Demo Mode: All data is saved in your browser's local storage and is not shared with other users.
        </p>
      </div>
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
        <Link to="/" className="text-2xl font-bold font-display text-light-text dark:text-dark-text">
          ALT<span className="text-brand-purple">Blogger</span>
        </Link>
        <div className="flex items-center space-x-6">
          <NavLink to="/" className={({isActive}) => isActive ? `${navLinkClasses} ${activeLinkClasses}` : navLinkClasses}>
            Home
          </NavLink>
          {user && (
             <NavLink to="/new" className={({isActive}) => isActive ? `${navLinkClasses} ${activeLinkClasses}` : navLinkClasses}>
                New Post
            </NavLink>
          )}
          {user ? (
            <div className="flex items-center space-x-4">
              <NavLink to="/profile" className="flex items-center space-x-2 text-light-subtle dark:text-dark-subtle hover:text-brand-purple dark:hover:text-brand-purple transition-colors">
                <span className="font-semibold">{user.username}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-purple to-brand-yellow flex items-center justify-center text-white font-bold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                </div>
              </NavLink>
              <button onClick={logout} className="bg-gray-200 hover:bg-gray-300 dark:bg-dark-card dark:hover:bg-gray-700 text-light-text dark:text-dark-text font-semibold py-2 px-4 rounded-full transition-colors text-sm">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/auth" className="bg-gradient-to-r from-brand-purple to-[#c7a9e8] hover:opacity-90 text-white font-semibold py-2 px-4 rounded-full transition-all shadow-md hover:shadow-lg">
              Login / Sign Up
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;