import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const AuthNavbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white/20 backdrop-blur-xl border-b border-white/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/profile" className="flex items-center space-x-2">
            <img src="/venti-icon.svg" alt="Venti" className="h-8 w-8" />
            <span className="text-xl font-bold text-gray-900">Venti</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/clubs" className="text-gray-700 hover:text-primary px-3 py-2 rounded-lg text-sm font-medium">
              Clubs
            </Link>
            <Link to="/events" className="text-gray-700 hover:text-primary px-3 py-2 rounded-lg text-sm font-medium">
              Events
            </Link>
            <Link to="/opportunities" className="text-gray-700 hover:text-primary px-3 py-2 rounded-lg text-sm font-medium">
              Opportunities
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary transition-colors"
              onClick={() => signOut()}
            >
              Sign Out
            </motion.button>
            <Link to="/profile" className="flex items-center space-x-2">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  className="h-8 w-8 rounded-full border-2 border-primary"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {user?.displayName?.[0] || 'U'}
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuthNavbar; 