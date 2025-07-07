import axios from 'axios';
import { auth } from '../config/firebase';
import { loadingController } from './useApiLoadingController';
import { useLoading } from '../context/LoadingContext';
import tokenManager from '../utils/tokenManager';

const api = axios.create({
  baseURL: 'http://192.168.100.77:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Track if we're already handling auth errors to prevent multiple redirects
let isHandlingAuthError = false;

// Function to handle authentication errors and redirect to login
const handleAuthError = (error?: any) => {
  if (isHandlingAuthError) return; // Prevent multiple redirects
  isHandlingAuthError = true;
  
  console.log('🔄 Authentication error detected, redirecting to login...');
  
  // Clear all auth data using token manager
  tokenManager.clearTokens();
  
  // Show loading briefly before redirect
  loadingController.show();
  
  setTimeout(() => {
    loadingController.hide();
    // Redirect to login page if not already there
    if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
      window.location.href = '/login';
    }
    isHandlingAuthError = false;
  }, 1000);
};

// Request interceptor for adding Firebase auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Skip authentication for auth endpoints that don't need it
      const skipAuthEndpoints = [
        'auth/firebase-login/',
        'auth/login/',
        'auth/register/',
        'auth/refresh/',
        'auth/verify-email/',
        'auth/reset-password/'
      ];
      
      const shouldSkipAuth = skipAuthEndpoints.some(endpoint => 
        config.url?.includes(endpoint)
      );
      
      if (shouldSkipAuth) {
        console.log('🔓 Skipping auth for endpoint:', config.url);
        return config;
      }
      
      // Use token manager to get valid token
      const token = await tokenManager.getValidToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // If no valid token and we're not on login page, redirect
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          handleAuthError();
          return Promise.reject(new Error('No authentication token available'));
        }
      }
      
      return config;
    } catch (error) {
      console.error('❌ Error in request interceptor:', error);
      handleAuthError(error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and retrying on 401
api.interceptors.response.use(
  (response) => {
    // Reset auth error flag on successful response
    isHandlingAuthError = false;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error:', error.message);
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        // Show network error message but don't redirect
        console.log('⚠️ Network timeout or connection error');
        return Promise.reject(error);
      }
      // For other network errors, try to refresh token
      try {
        const user = auth.currentUser;
        if (user) {
          await tokenManager.refreshToken(user);
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Failed to refresh token on network error:', refreshError);
      }
      return Promise.reject(error);
    }
    
    // Handle HTTP errors
    switch (error.response.status) {
      case 401:
        // Unauthorized - token expired or invalid
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          loadingController.show();
          
          try {
            const user = auth.currentUser;
            if (user) {
              // Try to refresh the token using token manager
              const freshToken = await tokenManager.refreshToken(user);
              originalRequest.headers.Authorization = `Bearer ${freshToken}`;
              
              // Retry the request with fresh token
              const result = await api(originalRequest);
              loadingController.hide();
              return result;
            } else {
              // No user, redirect to login
              handleAuthError();
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            loadingController.hide();
            handleAuthError(refreshError);
          }
        } else {
          // Already retried once, redirect to login
          handleAuthError();
        }
        break;
        
      case 403:
        // Forbidden - user doesn't have permission
        console.error('🚫 Access forbidden:', error.response.data);
        if (window.location.pathname !== '/login') {
          // Redirect to login for permission issues
          handleAuthError();
        }
        break;
        
      case 500:
        // Server error
        console.error('🔥 Server error:', error.response.data);
        // Don't redirect for server errors, just show error
        break;
        
      default:
        // Other HTTP errors
        console.error(`❌ HTTP ${error.response.status}:`, error.response.data);
        break;
    }
    
    return Promise.reject(error);
  }
);

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
  
  // Check if it's an auth-related error
  if (event.reason?.response?.status === 401 || 
      event.reason?.message?.includes('auth') ||
      event.reason?.code === 'auth/user-token-expired') {
    event.preventDefault();
    handleAuthError(event.reason);
  }
});

export const authAPI = {
  firebaseLogin: (firebaseToken: string) =>
    api.post('/auth/firebase-login/', { firebase_token: firebaseToken }),
  getCurrentUser: () => api.get('/auth/user/'),
  logout: () => api.post('/auth/logout/'),
};

export const userAPI = {
  getCurrentUser: () => api.get('/users/users/me/'),
  updateUser: (data: any) => api.put('/users/users/me/', data),
};

export default api; 