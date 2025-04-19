import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Send the user info to Django backend
    const response = await api.post('/auth/google/', {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL
    });

    // Store the Django session/token
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    await api.post('/auth/logout/');
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Regular Django authentication endpoints
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login/', credentials);
    const { token } = response.data;
    localStorage.setItem('token', token);
    return response.data;
  },

  register: async (userData: { email: string; password: string; name: string }) => {
    const response = await api.post('/auth/register/', userData);
    const { token } = response.data;
    localStorage.setItem('token', token);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout/');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  // Get current user profile from Django
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/user/');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }
}; 