import React from 'react';
import AuthNavbar from '../components/AuthNavbar';

const Courses = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <AuthNavbar />
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Course cards will be added here */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Coming Soon</h2>
            <p className="text-gray-600">Course management features are under development.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses; 