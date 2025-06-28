import React, { useState, Suspense, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const preloadRef = useRef(false);

  useEffect(() => {
    if (!preloadRef.current) {
      import('../api/auth').then(() => {
        preloadRef.current = true;
      });
    }
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      navigate('/home');
    } catch (error: any) {
      setError(error.message);
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

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-primary/80 text-white rounded-xl hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="h-5 w-5"
            loading="lazy"
          />
          <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          By signing in, you agree to our Terms and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};

export default Login; 