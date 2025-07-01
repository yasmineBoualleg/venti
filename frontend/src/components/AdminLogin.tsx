import { useState } from 'react';
import { motion } from 'framer-motion';
import { validateAdminCredentials } from '../utils/adminAuth';
import logger from '../utils/logger';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate admin credentials
      if (validateAdminCredentials(email, password)) {
        // Store admin session
        localStorage.setItem('admin_session', 'true');
        localStorage.setItem('admin_email', email);
        
        logger.userActivity('ADMIN_LOGIN', 'Admin logged in successfully', {
          email,
          timestamp: new Date().toISOString()
        });
        
        onLogin();
      } else {
        setError('Invalid admin credentials');
        logger.warning('ADMIN_LOGIN', 'Failed admin login attempt', {
          email,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      logger.error('ADMIN_LOGIN', 'Admin login error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-600">Enter admin credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Login as Admin'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="text-gray-600 hover:text-gray-800 text-sm underline"
          >
            Back to Home
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin; 