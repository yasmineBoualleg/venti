import React from 'react';
import { useLoading } from '../context/LoadingContext';

const LoaderTest: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();

  const handleShowLoader = () => {
    showLoading();
    setTimeout(() => {
      hideLoading();
    }, 3000); // Show spinner for 3 seconds
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-orange-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Test the Study Energy Loader!</h1>
      <button
        onClick={handleShowLoader}
        className="px-6 py-3 rounded-xl bg-orange-400 text-white font-semibold text-lg shadow-lg hover:bg-orange-500 transition-all duration-300"
      >
        Refill My Study Energy 🚀
      </button>
      <p className="mt-8 text-gray-600">Click the button to see the creative loading spinner in action.</p>
    </div>
  );
};

export default LoaderTest; 