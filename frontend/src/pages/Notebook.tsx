import React from 'react';
import { useParams } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import NotebookComponent from '../components/Notebook';

const Notebook = () => {
  const { subject } = useParams<{ subject: string }>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <AuthNavbar />
      <div className="container mx-auto px-4 py-8">
        <NotebookComponent subject={subject || 'General'} />
      </div>
    </div>
  );
};

export default Notebook; 