import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Club from './pages/Club';
import Messages from './pages/Messages';
import Discover from './pages/Discover';
import Events from './pages/Events';
import UniversityDashboard from './pages/UniversityDashboard';

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen bg-light-bg">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
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
                  path="/club/:id"
                  element={
                    <PrivateRoute>
                      <Club />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <PrivateRoute>
                      <Messages />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/discover"
                  element={
                    <PrivateRoute>
                      <Discover />
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
              </Routes>
            </main>
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
