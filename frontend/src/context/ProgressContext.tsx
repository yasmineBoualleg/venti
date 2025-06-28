import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Progress {
  totalXp: number;
  level: number;
  focusTime: number;
  streak: number;
  lastStudyDate: Date;
  achievements: string[];
  completedPomodoros: number;
  weeklyGoal: number;
}

interface ProgressContextType {
  progress: Progress;
  addXp: (amount: number) => void;
  addFocusTime: (minutes: number) => void;
  getNextLevelXp: () => number;
  addPomodoro: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const initialProgress: Progress = {
  totalXp: 0,
  level: 1,
  focusTime: 0,
  streak: 0,
  lastStudyDate: new Date(),
  achievements: [],
  completedPomodoros: 0,
  weeklyGoal: 15 * 60, // 15 hours in minutes
};

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Progress>(initialProgress);

  // Load progress from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedProgress = localStorage.getItem(`progress_${user.uid}`);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    }
  }, [user]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`progress_${user.uid}`, JSON.stringify(progress));
    }
  }, [progress, user]);

  const addXp = (amount: number) => {
    setProgress(prev => {
      const newTotalXp = prev.totalXp + amount;
      const newLevel = Math.floor(newTotalXp / 1000) + 1;
      
      // Check for level-up achievements
      const newAchievements = [...prev.achievements];
      if (newLevel > prev.level) {
        newAchievements.push(`Reached Level ${newLevel}!`);
      }

      return {
        ...prev,
        totalXp: newTotalXp,
        level: newLevel,
        achievements: newAchievements,
      };
    });
  };

  const addFocusTime = (minutes: number) => {
    setProgress(prev => {
      const today = new Date().toDateString();
      const lastStudy = new Date(prev.lastStudyDate).toDateString();
      const newStreak = today === lastStudy ? prev.streak : prev.streak + 1;

      // Check for streak achievements
      const newAchievements = [...prev.achievements];
      if (newStreak === 7) newAchievements.push('7-Day Streak!');
      if (newStreak === 30) newAchievements.push('30-Day Streak!');

      return {
        ...prev,
        focusTime: prev.focusTime + minutes,
        streak: newStreak,
        lastStudyDate: new Date(),
        achievements: newAchievements,
      };
    });
  };

  const addPomodoro = () => {
    setProgress(prev => {
      const newPomodoros = prev.completedPomodoros + 1;
      const newAchievements = [...prev.achievements];
      
      // Check for Pomodoro achievements
      if (newPomodoros === 10) newAchievements.push('10 Pomodoros Completed!');
      if (newPomodoros === 50) newAchievements.push('50 Pomodoros Completed!');
      if (newPomodoros === 100) newAchievements.push('100 Pomodoros Completed!');

      return {
        ...prev,
        completedPomodoros: newPomodoros,
        achievements: newAchievements,
      };
    });
  };

  const getNextLevelXp = () => {
    return progress.level * 1000;
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,
        addXp,
        addFocusTime,
        getNextLevelXp,
        addPomodoro,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}; 