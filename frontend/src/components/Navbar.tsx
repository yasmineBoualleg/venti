import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 py-8">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/venti-icon.svg" 
              alt="Venti" 
              className="h-8 w-8 transition-transform group-hover:scale-110" 
            />
            <span className="ml-2 text-xl font-bold text-gray-900">Venti</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('features')}
              className="text-gray-700 hover:text-primary px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/30"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-gray-700 hover:text-primary px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/30"
            >
              How it Works
            </button>
            <Link
              to="/login"
              className="bg-primary/80 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-primary transition-all hover:scale-105 hover:shadow-lg"
            >
              Login / Join
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 