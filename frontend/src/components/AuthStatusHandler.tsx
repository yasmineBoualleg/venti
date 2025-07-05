import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthStatusHandlerProps {
  children: React.ReactNode;
}

const AuthStatusHandler: React.FC<AuthStatusHandlerProps> = ({ children }) => {
  const { tokenExpired, refreshToken, isAuthenticated } = useAuth();

  useEffect(() => {
    // Handle token expiration
    if (tokenExpired && isAuthenticated) {
      console.log('🔄 Token expired, attempting refresh...');
      refreshToken().catch(() => {
        // If refresh fails, user will be redirected to login by AuthContext
        console.log('❌ Token refresh failed, redirecting to login...');
      });
    }
  }, [tokenExpired, isAuthenticated, refreshToken]);

  // Show loading state while handling token expiration
  if (tokenExpired && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Refreshing your session...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we secure your connection</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthStatusHandler; 