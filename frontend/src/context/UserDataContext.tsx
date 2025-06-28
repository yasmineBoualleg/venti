import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useProgress } from './ProgressContext';
import api from '../api/api';

interface Notebook {
  id: string;
  name: string;
  subject: string;
  color: string;
  icon: string;
  type: 'copybook' | 'mindmap' | 'flashcards' | 'study';
  createdAt: Date;
  updatedAt: Date;
  notes: Note[];
  slides: Slide[];
}

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  color: string;
  type: 'text' | 'list' | 'mindmap' | 'flashcard';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
    uploadedAt: Date;
  }[];
  isPinned: boolean;
  studyMode?: {
    lastReviewed?: Date;
    reviewCount: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  type: 'exam' | 'assignment' | 'meeting' | 'other';
  status: 'upcoming' | 'completed' | 'missed';
}

interface UserData {
  notebooks: Notebook[];
  events: Event[];
}

interface PendingOperation {
  type: 'add' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: number;
}

interface Slide {
  id: string;
  title: string;
  content: string;
  elements: CanvasElement[];
  createdAt: Date;
  updatedAt: Date;
  order: number;
}

interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'drawing';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: {
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontFamily?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    opacity?: number;
    rotation?: number;
  };
  zIndex: number;
}

interface UserDataContextType {
  userData: UserData;
  isOnline: boolean;
  pendingOperations: PendingOperation[];
  addNotebook: (notebook: Omit<Notebook, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'slides'>) => void;
  updateNotebook: (id: string, updates: Partial<Notebook>) => void;
  deleteNotebook: (id: string) => void;
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  retryPendingOperations: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addXp } = useProgress();
  const [userData, setUserData] = useState<UserData>({
    notebooks: [],
    events: [],
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Comment: Helper to ensure notes and slides are always arrays
  const normalizeNotebook = (nb: any) => ({
    ...nb,
    notes: Array.isArray(nb.notes) ? nb.notes : [],
    slides: Array.isArray(nb.slides) ? nb.slides : [],
  });

  // Comment: Import axios instance for API calls
  // Comment: Replace Firestore user data loading logic with Django REST API call
  useEffect(() => {
    if (!user) return;
    // Comment: Fetch notebooks and events from Django API
    const fetchData = async () => {
      try {
        // Comment: Fetch notebooks from the /posts/notebooks/ endpoint
        const notebooksRes = await api.get('/posts/notebooks/');
        // Comment: Fetch events for the user
        const eventsRes = await api.get('/posts/events/', { params: { participant: user.uid } });
        // Comment: Normalize notebooks to always have notes and slides arrays
              setUserData({
          notebooks: (Array.isArray(notebooksRes.data.results) ? notebooksRes.data.results : Array.isArray(notebooksRes.data) ? notebooksRes.data : []).map(normalizeNotebook),
          events: Array.isArray(eventsRes.data.results) ? eventsRes.data.results : Array.isArray(eventsRes.data) ? eventsRes.data : [],
        });
      } catch (err) {
        console.error('Error loading user data from Django API:', err);
      }
    };
    fetchData();
  }, [user]);

  // Comment: Remove retryPendingOperations function body and all Firestore references
  const retryPendingOperations = async () => {
    // No-op: Firestore logic removed, nothing to retry
  };

  // Comment: Explicitly type all async function parameters
  const addNotebook = async (notebook: any) => {
    if (!user) return;
    try {
      const res = await api.post('/posts/notebooks/', { ...notebook });
      // Comment: Normalize the new notebook
      setUserData(prev => ({ ...prev, notebooks: [...prev.notebooks, normalizeNotebook(res.data)] }));
      addXp(20);
    } catch (err) {
      console.error('Error adding notebook:', err);
    }
  };

  // Comment: Explicitly type all async function parameters
  const updateNotebook = async (id: string, updates: any) => {
    if (!user) return;
    try {
      const res = await api.patch(`/posts/notebooks/${id}/`, updates);
      // Comment: Normalize the updated notebook
      setUserData(prev => ({
        ...prev,
        notebooks: prev.notebooks.map(nb => nb.id === id ? normalizeNotebook(res.data) : nb),
      }));
    } catch (err) {
      console.error('Error updating notebook:', err);
    }
  };

  // Comment: Explicitly type all async function parameters
  const deleteNotebook = async (id: string) => {
    if (!user) return;
    try {
      await api.delete(`/posts/notebooks/${id}/`);
      setUserData(prev => ({
        ...prev,
        notebooks: prev.notebooks.filter(nb => nb.id !== id),
      }));
    } catch (err) {
      console.error('Error deleting notebook:', err);
    }
  };

  // Comment: Explicitly type all async function parameters
  const addEvent = async (event: any) => {
    if (!user) return;
    try {
      const res = await api.post('/events/', event);
      setUserData(prev => ({ ...prev, events: [...prev.events, res.data] }));
    } catch (err) {
      console.error('Error adding event:', err);
    }
  };

  // Comment: Explicitly type all async function parameters
  const updateEvent = async (id: string, updates: any) => {
    if (!user) return;
    try {
      const res = await api.patch(`/events/${id}/`, updates);
      setUserData(prev => ({
        ...prev,
        events: prev.events.map(ev => ev.id === id ? res.data : ev),
      }));
    } catch (err) {
      console.error('Error updating event:', err);
    }
  };

  // Comment: Explicitly type all async function parameters
  const deleteEvent = async (id: string) => {
    if (!user) return;
    try {
      await api.delete(`/events/${id}/`);
      setUserData(prev => ({
        ...prev,
        events: prev.events.filter(ev => ev.id !== id),
      }));
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  return (
    <UserDataContext.Provider
      value={{
        userData,
        isOnline,
        pendingOperations,
        addNotebook,
        updateNotebook,
        deleteNotebook,
        addEvent,
        updateEvent,
        deleteEvent,
        retryPendingOperations: () => {}, // No-op
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}; 