import axios from 'axios';
import { auth } from '../config/firebase';
import { loadingController } from './useApiLoadingController';
import { useLoading } from '../context/LoadingContext';

const api = axios.create({
  baseURL: 'http://192.168.100.77:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding Firebase auth token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    let token = null;
    if (user) {
      token = await user.getIdToken(true); // Always get a fresh token
      localStorage.setItem('firebase_token', token);
    } else {
      token = localStorage.getItem('firebase_token');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and retrying on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Only retry once
    if (error.response?.status === 401 && !originalRequest._retry) {
      loadingController.show();
      originalRequest._retry = true;
      try {
        const user = auth.currentUser;
        if (user) {
          const freshToken = await user.getIdToken(true);
          localStorage.setItem('firebase_token', freshToken);
          originalRequest.headers.Authorization = `Bearer ${freshToken}`;
          const result = await api(originalRequest);
          loadingController.hide();
          return result;
        }
      } catch (refreshError) {
        loadingController.hide();
        // If refreshing fails, fall through to logout
      }
      loadingController.hide();
    }
    // If still unauthorized or not logged in, logout and redirect
    if (error.response?.status === 401) {
      localStorage.removeItem('firebase_token');
      localStorage.removeItem('user');
      loadingController.show();
      setTimeout(() => {
        loadingController.hide();
        window.location.href = '/login';
      }, 1500);
      return; // Prevent further execution
    }
    return Promise.reject(error);
  }
);

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