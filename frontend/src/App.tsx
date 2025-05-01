import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import PrivateRoute from './components/PrivateRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ClubDashboard from './pages/ClubDashboard';
import Events from './pages/Events';
import UniversityDashboard from './pages/UniversityDashboard';
import Opportunities from './pages/Opportunities';

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />

              {/* Protected routes */}
              <Route
                path="/university"
                element={
                  <PrivateRoute>
                    <UniversityDashboard />
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
              <Route
                path="/clubs"
                element={
                  <PrivateRoute>
                    <ClubDashboard />
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
                path="/opportunities"
                element={
                  <PrivateRoute>
                    <Opportunities />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
