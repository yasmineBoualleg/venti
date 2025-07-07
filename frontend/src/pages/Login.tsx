import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { handleRedirectResult } from '../api/auth';
import Spinner from '../components/Spinner';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  // Handle redirect result when component mounts
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        setLoading(true);
        const user = await handleRedirectResult();
        if (user) {
          // Redirect to profile page after successful redirect sign-in
          navigate('/profile');
        }
      } catch (error: any) {
        console.error('Error handling redirect result:', error);
        
        // Provide more specific error messages
        if (error.code === 'auth/internal-error') {
          setError('Authentication configuration issue. Please check Firebase setup or try again.');
        } else if (error.code === 'auth/unauthorized-domain') {
          setError('This domain is not authorized for authentication. Please contact support.');
        } else {
          setError('Authentication failed. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    checkRedirectResult();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Starting Google sign-in process...');
      const user = await signInWithGoogle();
      
      if (user) {
        console.log('Authentication successful, redirecting to profile...');
        // Redirect to profile page after successful authentication
        navigate('/profile');
      }
      // If user is null, it means we're using redirect and the page will reload
    } catch (error: any) {
      console.error('Google sign-in failed:', error);
      setError(`Authentication failed: ${error.message}`);
      setShowEmailForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // For now, we'll create a mock user for testing
      // In a real app, you'd send this to your backend
      const mockUser = {
        id: 1,
        email: email,
        username: email.split('@')[0],
        first_name: 'Test',
        last_name: 'User',
        firebase_uid: 'mock_uid_' + Date.now()
      };
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('firebase_token', 'mock_token_' + Date.now());
      
      console.log('Mock authentication successful:', mockUser);
      navigate('/profile');
      
    } catch (error: any) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Welcome to Venti
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center mb-4">
            <Spinner />
          </div>
        )}

        {!showEmailForm ? (
          <>
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-primary/80 text-white rounded-xl hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 mb-4"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="h-5 w-5"
          />
          <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
        </button>

            <div className="text-center">
              <button
                onClick={() => setShowEmailForm(true)}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Or sign in with email (for testing)
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Back to Google sign-in
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          By signing in, you agree to our Terms and Privacy Policy
        </p>

        <div className="mt-4 text-center space-y-2">
          <a 
            href="/test" 
            className="text-blue-600 hover:text-blue-800 text-sm underline block"
          >
            Test Firebase Configuration
          </a>
          <a 
            href="/" 
            className="text-gray-600 hover:text-gray-800 text-sm underline block"
          >
            Back to Home
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 