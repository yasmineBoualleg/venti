import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

interface LanguageProviderProps {
  children: ReactNode;
}

const translations = {
  en: {
    // Hero Section
    'hero.chaos': 'Chaos',
    'hero.focus': 'Focus',
    'hero.description': 'One unified platform for your academic life. Combine your social connections, communications, resources, and classroom activities in one place.',
    'cta.getStarted': 'Get Started',
    
    // Features
    'feature.socialConnect': 'Social Connect',
    'feature.socialConnect.desc': 'Share moments and stay connected with your academic community',
    'feature.messaging': 'Instant Messaging',
    'feature.messaging.desc': 'Direct communication with classmates and professors',
    'feature.resources': 'Resource Hub',
    'feature.resources.desc': 'Store and share all your academic resources in one place',
    'feature.classroom': 'Virtual Classroom',
    'feature.classroom.desc': 'Manage assignments, discussions, and course materials',
    'feature.courses': 'Teacher Courses',
    'feature.courses.desc': 'Access specialized courses and materials from your professors',
    'feature.xp': 'XP & Levels',
    'feature.xp.desc': 'Earn points and level up as you achieve academic goals',
    'feature.opportunities': 'Opportunities',
    'feature.opportunities.desc': 'Discover scholarships, internships, and career opportunities',
    'feature.university': 'University Space',
    'feature.university.desc': 'Your dedicated university hub for events, news, and resources'
  },
  fr: {
    // ... existing French translations ...
  },
  ar: {
    // ... existing Arabic translations ...
  },
  dz: {
    // ... existing Darija translations ...
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    document.documentElement.dir = ['ar', 'dz'].includes(lang) ? 'rtl' : 'ltr';
    localStorage.setItem('preferredLanguage', lang);
  };

  const t = (key: string): string => {
    return translations[currentLanguage as keyof typeof translations]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 