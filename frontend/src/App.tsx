import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { LoadingProvider } from './context/LoadingContext';
import AuthStatusHandler from './components/AuthStatusHandler';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import FirebaseTest from './pages/FirebaseTest';
import LogsViewer from './pages/LogsViewer';
import TestLogging from './pages/TestLogging';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import ProfilePage from './pages/Profile';
import ClubsPage from './pages/Clubs';
import CoursesPage from './pages/Courses';
import NotebooksPage from './pages/Notebooks';
import CommunityPage from './pages/Community';
import ChatPage from './pages/Chat';
import StudyArenaPage from './pages/StudyArena';
import LoaderTest from './pages/LoaderTest';
import { useAuth } from './context/AuthContext';
import ApiLoadingControllerBridge from './api/ApiLoadingControllerBridge';

// Simple protected route wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }
  return children;
};

const App = () => {
  return (
    <LoadingProvider>
      <ApiLoadingControllerBridge />
    <AuthProvider>
        <AuthStatusHandler>
      <LanguageProvider>
          <div className="min-h-screen">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
                <Route path="/test" element={<FirebaseTest />} />
                <Route path="/loader-test" element={<LoaderTest />} />
              {/* Protected routes */}
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/clubs" element={<ProtectedRoute><ClubsPage /></ProtectedRoute>} />
                <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
                <Route path="/notebooks" element={<ProtectedRoute><NotebooksPage /></ProtectedRoute>} />
                <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/study-arena" element={<ProtectedRoute><StudyArenaPage /></ProtectedRoute>} />
                {/* Admin-only routes */}
                <Route path="/admin/logs" element={<AdminProtectedRoute><LogsViewer /></AdminProtectedRoute>} />
                <Route path="/admin/test-logging" element={<AdminProtectedRoute><TestLogging /></AdminProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
      </LanguageProvider>
        </AuthStatusHandler>
    </AuthProvider>
    </LoadingProvider>
  );
};

export default App;
