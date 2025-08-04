import React, { useContext, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const HamburgerIcon: React.FC = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
);

const CloseIcon: React.FC = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);

const Header: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!authContext) return null;
  const { user, logout } = authContext;

  const navLinkClasses = "text-light-subtle dark:text-dark-subtle hover:text-brand-purple dark:hover:text-brand-purple transition-colors font-medium";
  const activeLinkClasses = "text-brand-purple dark:text-brand-purple";
  const mobileLinkBaseClasses = "text-2xl font-semibold text-light-text dark:text-dark-text transition-all duration-300 transform";

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
        <Link to="/" className="text-2xl font-bold font-display text-light-text dark:text-dark-text">
          ALT<span className="text-brand-purple">Blogger</span>
        </Link>

        {/* --- Desktop Menu (Hidden on mobile) --- */}
        <div className="hidden md:flex items-center space-x-6">
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
        
        {/* --- Hamburger Button (Visible on mobile) --- */}
        <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
        </div>
      </nav>

      {/* --- Mobile Menu --- */}
      <div 
        className={`
          md:hidden absolute top-full left-0 w-full bg-light-bg dark:bg-dark-bg border-b border-gray-200 dark:border-gray-800
          transition-opacity duration-300 ease-in-out
          ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div className="flex flex-col items-center space-y-6 py-8">
            <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={`${mobileLinkBaseClasses} ${isMenuOpen ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 -translate-y-4'}`}>Home</NavLink>
            {user && <NavLink to="/new" onClick={() => setIsMenuOpen(false)} className={`${mobileLinkBaseClasses} ${isMenuOpen ? 'opacity-100 translate-y-0 delay-200' : 'opacity-0 -translate-y-4'}`}>New Post</NavLink>}
            {user ? (
                <>
                    <NavLink to="/profile" onClick={() => setIsMenuOpen(false)} className={`${mobileLinkBaseClasses} ${isMenuOpen ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 -translate-y-4'}`}>Profile</NavLink>
                    <button onClick={handleLogout} className={`${mobileLinkBaseClasses} ${isMenuOpen ? 'opacity-100 translate-y-0 delay-400' : 'opacity-0 -translate-y-4'}`}>Logout</button>
                </>
            ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)} className={`transition-all duration-300 transform ${isMenuOpen ? 'opacity-100 translate-y-0 delay-200' : 'opacity-0 -translate-y-4'} bg-gradient-to-r from-brand-purple to-[#c7a9e8] text-white font-semibold py-3 px-6 rounded-full`}>
                    Login / Sign Up
                </Link>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;