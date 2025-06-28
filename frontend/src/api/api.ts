import axios from 'axios';
import { auth } from '../config/firebase';

const api = axios.create({
  //ALWAYS USE THIS  BASE FOR API CALLS I MESSED THE ENDPOINTS ...
  baseURL: 'http://127.0.0.1:8001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    // Get the token from localStorage (for Django sessions)
    const token = localStorage.getItem('token');
    // Try to get the Firebase ID token if a user is logged in
    let firebaseToken = null;
    // Check if a user is logged in to Firebase
    if (auth.currentUser) {
      // Try to get the ID token from Firebase Auth
      firebaseToken = await auth.currentUser.getIdToken();
      // Comment: Log the Firebase ID token for debugging
      console.log('Firebase ID token:', firebaseToken);
    }
    // If a Firebase ID token exists, use it as the Authorization header
    if (firebaseToken) {
      // Comment: Set the Authorization header to the Firebase ID token
      config.headers.Authorization = `Bearer ${firebaseToken}`;
      // Comment: Log the Authorization header for debugging
      console.log('Authorization header:', config.headers.Authorization);
    } else if (token) {
      // Comment: Fallback to the token from localStorage if no Firebase token
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Comment: Return the config for the request
    return config;
  },
  // Comment: Handle request errors
  (error) => {
    // Comment: Reject the promise with the error
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { email: string; password: string; name: string }) =>
    api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profiles/me/'),
  updateProfile: (data: any) => api.patch('/users/profiles/me/', data),
  follow: (profileId: number) => api.post(`/users/profiles/${profileId}/follow/`),
  unfollow: (profileId: number) => api.post(`/users/profiles/${profileId}/unfollow/`),
  getFollowers: (profileId: number) => api.get(`/users/profiles/${profileId}/followers/`),
  getFollowing: (profileId: number) => api.get(`/users/profiles/${profileId}/following/`),
};

export const eventAPI = {
  getEvents: () => api.get('/events'),
  getEventById: (id: string) => api.get(`/events/${id}`),
  createEvent: (data: any) => api.post('/events', data),
  updateEvent: (id: string, data: any) => api.put(`/events/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/events/${id}`),
};

export default api; 