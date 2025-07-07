import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import logger from '../utils/logger';
import Spinner from './Spinner';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already authenticated
    const adminSession = localStorage.getItem('admin_session');
    const adminEmail = localStorage.getItem('admin_email');
    
    if (adminSession === 'true' && adminEmail) {
      setIsAdminAuthenticated(true);
      logger.info('ADMIN_ACCESS', 'Admin session restored', { email: adminEmail });
    }
    
    setLoading(false);
  }, []);

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_email');
    setIsAdminAuthenticated(false);
    
    const adminEmail = localStorage.getItem('admin_email');
    logger.userActivity('ADMIN_LOGOUT', 'Admin logged out', {
      email: adminEmail,
      timestamp: new Date().toISOString()
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <AdminLogin onLogin={handleAdminLogin} />;
  }

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Admin Header */}
      <div className="bg-white/20 backdrop-blur-xl border-b border-white/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Admin Mode
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {localStorage.getItem('admin_email')}
              </span>
              <button
                onClick={handleAdminLogout}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Admin Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default AdminProtectedRoute; 