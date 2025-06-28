import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const AuthNavbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/home', label: 'Home', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { path: '/courses', label: 'Courses', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )},
    { path: '/events', label: 'Events', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 py-4">
          {/* Logo */}
          <Link to="/home" className="flex items-center group">
            <img 
              src="/venti-icon.svg" 
              alt="Venti" 
              className="h-8 w-8 transition-transform group-hover:scale-110" 
              loading='lazy'
            />
            <span className="ml-2 text-xl font-bold text-gray-900">Venti</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${isActive(item.path)
                    ? 'bg-white/50 text-primary shadow-lg'
                    : 'text-gray-700 hover:text-primary hover:bg-white/30'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <Link
              to="/messages"
              className="relative p-2 text-gray-700 hover:text-primary rounded-xl hover:bg-white/30 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center space-x-2 p-2 rounded-xl hover:bg-white/30 transition-colors"
            >
              <img
                src={user?.photoURL || '/default-avatar.png'}
                alt={user?.displayName || 'User'}
                className="w-8 h-8 rounded-full"
              />
            </Link>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 p-2 text-gray-700 hover:text-red-500 rounded-xl hover:bg-white/30 transition-colors"
              title="Logout"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default AuthNavbar; 