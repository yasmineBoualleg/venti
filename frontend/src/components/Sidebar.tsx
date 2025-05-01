import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Landing', icon: 'home' },
    { path: '/profile', label: 'Profile', icon: 'user' },
    { path: '/clubs', label: 'Clubs', icon: 'users' },
    { path: '/university', label: 'University', icon: 'academic-cap' },
    { path: '/events', label: 'Events', icon: 'calendar' },
    { path: '/opportunities', label: 'Opportunities', icon: 'briefcase' },
  ];

  return (
    <aside className="w-64 h-screen bg-white shadow-md fixed left-0 top-0 pt-16">
      <nav className="mt-8">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${
              location.pathname === item.path ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <span className="material-icons-outlined mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar; 