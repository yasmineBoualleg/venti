import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h1>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
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
              className="w-full px-4 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Create a password"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register; 