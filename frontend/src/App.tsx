import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProgressProvider } from './context/ProgressContext';
import { UserDataProvider } from './context/UserDataContext';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';

// Use React.lazy and Suspense for all main pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Home = lazy(() => import('./pages/Home'));
const Courses = lazy(() => import('./pages/Courses'));
const Events = lazy(() => import('./pages/Events'));
const UniversityDashboard = lazy(() => import('./pages/UniversityDashboard'));
const Opportunities = lazy(() => import('./pages/Opportunities'));
const Notebook = lazy(() => import('./pages/Notebook'));
const Profile = lazy(() => import('./pages/Profile'));

// Root route component that handles conditional rendering
const RootRoute: React.FC = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/home" replace /> : <Landing />;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <ProgressProvider>
            <UserDataProvider>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>}>
                <Routes>
                    <Route path="/" element={<RootRoute />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/home"
                    element={
                      <PrivateRoute>
                        <Home />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/courses"
                    element={
                      <PrivateRoute>
                        <Courses />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/events"
                    element={
                      <PrivateRoute>
                        <Events />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/university"
                    element={
                      <PrivateRoute>
                        <UniversityDashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/opportunities"
                    element={
                      <PrivateRoute>
                        <Opportunities />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/notes/:subject"
                    element={
                      <PrivateRoute>
                        <Notebook />
                      </PrivateRoute>
                    }
                  />
                    <Route
                      path="/profile"
                      element={
                        <PrivateRoute>
                          <Profile />
                      </PrivateRoute>
                    }
                  />
                </Routes>
                </Suspense>
              </div>
            </UserDataProvider>
          </ProgressProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
