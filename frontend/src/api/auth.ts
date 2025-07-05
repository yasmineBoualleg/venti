import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut as firebaseSignOut, User } from 'firebase/auth';
import api from './api';
import logger from '../utils/logger';

export const signInWithGoogle = async (): Promise<User> => {
  try {
    logger.info('AUTHENTICATION', 'Starting Google sign-in process');
    console.log('Starting Google sign-in process...');
    
    const provider = new GoogleAuthProvider();
    
    // Add scopes if needed
    provider.addScope('email');
    provider.addScope('profile');
    
    console.log('Firebase auth object:', auth);
    console.log('Google provider configured');
    
    // Try popup first, fallback to redirect if it fails
    let result;
    try {
      result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful (popup):', result.user.email);
      logger.userActivity('AUTHENTICATION', 'Google sign-in successful via popup', {
        method: 'popup',
        email: result.user.email,
        uid: result.user.uid
      });
    } catch (popupError: any) {
      console.log('Popup failed, trying redirect:', popupError.code);
      logger.warning('AUTHENTICATION', 'Popup sign-in failed, falling back to redirect', {
        error: popupError.code,
        message: popupError.message
      });
      
      if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
        // Fallback to redirect
        await signInWithRedirect(auth, provider);
        logger.info('AUTHENTICATION', 'Redirecting to Google sign-in');
        // The page will redirect, so we won't reach the code below
        return null as any;
      } else {
        throw popupError;
      }
    }
    
    // Get the Firebase ID token
    const firebaseToken = await result.user.getIdToken();
    console.log('Firebase token obtained, length:', firebaseToken.length);
    
    // Send token to Django backend using the correct endpoint
    console.log('Sending token to Django backend...');
    console.log('Token length:', firebaseToken.length);
    console.log('Token preview:', firebaseToken.substring(0, 50) + '...');
    
    try {
    const response = await api.post('auth/firebase-login/', {
      firebase_token: firebaseToken
    });
    
    console.log('Django authentication successful:', response.data);
    logger.userActivity('AUTHENTICATION', 'Django backend authentication successful', {
      user_id: response.data.user?.id,
      email: response.data.user?.email
    }, response.data.user?.id);
    
    // Store the Firebase token for future API calls
    localStorage.setItem('firebase_token', firebaseToken);
    
    // Store user data
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('User data stored in localStorage');
      logger.userCreated(response.data.user.id, response.data.user);
    }
    
    return result.user;
    } catch (apiError: any) {
      console.error('❌ Django backend authentication failed:', {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        message: apiError.message
      });
      
      // Log the specific error from Django
      if (apiError.response?.data?.error) {
        console.error('Django error message:', apiError.response.data.error);
      }
      
      // Re-throw the error with more context
      throw new Error(`Backend authentication failed: ${apiError.response?.data?.error || apiError.message}`);
    }
  } catch (error: any) {
    console.error('Detailed error information:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name
    });
    
    // Log the error
    logger.authenticationError(error, 'Google sign-in');
    
    // Provide more specific error messages
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled by the user');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked. Please allow popups for this site.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for Firebase authentication. Please contact support.');
    } else if (error.code === 'auth/internal-error') {
      throw new Error('Firebase authentication error. Please try again or check your network connection.');
    } else {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }
};

// Handle redirect result (call this when the page loads after redirect)
export const handleRedirectResult = async (): Promise<User | null> => {
  try {
    logger.info('AUTHENTICATION', 'Handling redirect result');
    console.log('Starting redirect result handling...');
    
    // Check if we're in a redirect flow
    const urlParams = new URLSearchParams(window.location.search);
    const hasRedirectParams = urlParams.has('apiKey') || urlParams.has('authType');
    console.log('URL has redirect parameters:', hasRedirectParams);
    console.log('Current URL:', window.location.href);
    
    const result = await getRedirectResult(auth);
    console.log('Redirect result:', result);
    
    if (result) {
      console.log('Redirect sign-in successful:', result.user.email);
      logger.userActivity('AUTHENTICATION', 'Google sign-in successful via redirect', {
        method: 'redirect',
        email: result.user.email,
        uid: result.user.uid
      });
      
      // Get the Firebase ID token
      const firebaseToken = await result.user.getIdToken();
      console.log('Firebase token obtained from redirect, length:', firebaseToken.length);
      
      // Send token to Django backend
      console.log('Sending token to Django backend...');
      const response = await api.post('auth/firebase-login/', {
        firebase_token: firebaseToken
      });
      
      console.log('Django authentication successful:', response.data);
      logger.userActivity('AUTHENTICATION', 'Django backend authentication successful from redirect', {
        user_id: response.data.user?.id,
        email: response.data.user?.email
      }, response.data.user?.id);
      
      // Store the Firebase token for future API calls
      localStorage.setItem('firebase_token', firebaseToken);
      
      // Store user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('User data stored in localStorage');
        logger.userCreated(response.data.user.id, response.data.user);
      }
      
      return result.user;
    } else {
      console.log('No redirect result found - user may not have completed sign-in');
    }
    return null;
  } catch (error: any) {
    console.error('Detailed redirect result error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name,
      url: window.location.href
    });
    
    // Check for specific error conditions
    if (error.code === 'auth/internal-error') {
      console.error('Internal error details - this often indicates:');
      console.error('1. Domain not authorized in Firebase Console');
      console.error('2. Google Sign-in not enabled in Firebase Console');
      console.error('3. Network connectivity issues');
      console.error('4. Firebase configuration mismatch');
    }
    
    logger.authenticationError(error, 'redirect result handling');
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    logger.info('AUTHENTICATION', 'Starting sign-out process');
    console.log('Starting sign-out process...');
    
    // Check if we have a mock token (for testing)
    const firebaseToken = localStorage.getItem('firebase_token');
    const isMockAuth = firebaseToken && firebaseToken.startsWith('mock_token_');
    
    if (!isMockAuth) {
      // Logout from Django backend
      await api.post('auth/logout/');
      console.log('Django logout successful');
      
      // Logout from Firebase
    await firebaseSignOut(auth);
      console.log('Firebase logout successful');
    } else {
      console.log('Mock authentication logout');
    }
    
    // Clear local storage
    localStorage.removeItem('firebase_token');
    localStorage.removeItem('user');
    console.log('Local storage cleared');
    
    logger.userActivity('AUTHENTICATION', 'User signed out successfully', {
      method: !isMockAuth ? 'firebase' : 'mock'
    });
  } catch (error) {
    console.error('Error signing out:', error);
    logger.error('AUTHENTICATION', 'Error during sign-out', error);
    // Even if there's an error, clear local storage
    localStorage.removeItem('firebase_token');
    localStorage.removeItem('user');
    throw error;
  }
};

// Get current Firebase token
export const getFirebaseToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken(true); // Force refresh
      localStorage.setItem('firebase_token', token);
      return token;
    } catch (error) {
      console.error('Error getting Firebase token:', error);
      logger.error('AUTHENTICATION', 'Error getting Firebase token', error);
      return null;
    }
  }
  return localStorage.getItem('firebase_token');
};

// Firebase authentication API
export const firebaseAuthAPI = {
  // Get current user from Django backend
  getCurrentUser: async () => {
    try {
      const response = await api.get('auth/user/');
      logger.info('API', 'Current user retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      logger.apiError('auth/user/', error);
      throw error;
    }
  },

  // Update user profile
  updateUser: async (userData: any) => {
    try {
      const response = await api.put('users/users/me/', userData);
      logger.userActivity('USER_PROFILE', 'User profile updated', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      logger.apiError('users/users/me/', error);
      throw error;
    }
  }
};

// Regular Django authentication endpoints (for reference)
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('auth/login/', credentials);
    const { token } = response.data;
    localStorage.setItem('token', token);
      logger.userActivity('AUTHENTICATION', 'Email login successful', {
        email: credentials.email
      });
    return response.data;
    } catch (error) {
      logger.apiError('auth/login/', error);
      throw error;
    }
  },

  register: async (userData: { email: string; password: string; name: string }) => {
    try {
      const response = await api.post('auth/register/', userData);
    const { token } = response.data;
    localStorage.setItem('token', token);
      logger.userActivity('AUTHENTICATION', 'User registration successful', {
        email: userData.email,
        name: userData.name
      });
    return response.data;
    } catch (error) {
      logger.apiError('auth/register/', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('auth/logout/');
      localStorage.removeItem('token');
      logger.userActivity('AUTHENTICATION', 'Email logout successful');
    } catch (error) {
      console.error('Error logging out:', error);
      logger.apiError('auth/logout/', error);
      throw error;
    }
  },

  // Get current user from Django
  getCurrentUser: async () => {
    try {
      const response = await api.get('auth/user/');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      logger.apiError('auth/user/', error);
      throw error;
    }
  }
}; 