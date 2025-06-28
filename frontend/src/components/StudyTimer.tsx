import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '../context/ProgressContext';

interface TimerProps {
  onClose?: () => void;
  isModal?: boolean;
}

const StudyTimer: React.FC<TimerProps> = ({ onClose, isModal = false }) => {
  const { addXp, addFocusTime, addPomodoro, progress } = useProgress();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = useCallback(() => {
    setIsRunning(true);
    setShowNotification(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
    setIsBreak(false);
  }, []);

  const completePomodoro = useCallback(() => {
    addXp(50); // XP for completing a Pomodoro
    addFocusTime(25); // Add 25 minutes to focus time
    addPomodoro(); // Update completed pomodoros count
    setIsBreak(true);
    setTimeLeft(5 * 60); // 5-minute break
    setShowNotification(true);
  }, [addXp, addFocusTime, addPomodoro]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (!isBreak) {
              completePomodoro();
            } else {
              setIsBreak(false);
              setTimeLeft(25 * 60);
              setIsRunning(false);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, completePomodoro]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  // Show notification when timer completes
  useEffect(() => {
    if (showNotification && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(isBreak ? 'Break Time!' : 'Pomodoro Complete!', {
        body: isBreak ? 'Take a short break.' : 'Great job! Time for a break.',
        icon: '/logo.png',
      });
    }
  }, [showNotification, isBreak]);

  const progressPercentage = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  const timerContent = (
    <>
      <div className="relative mb-8">
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="text-6xl font-bold text-gray-800 mb-2">
          {formatTime(timeLeft)}
        </div>
        <div className="text-sm text-gray-500">
          {isBreak ? 'Take a short break' : 'Stay focused!'}
        </div>
      </div>

      <div className="flex justify-center space-x-4 mb-8">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            Start
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="px-6 py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Pause
          </button>
        )}
        <button
          onClick={resetTimer}
          className="px-6 py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Today's Progress</span>
          <span className="text-sm text-primary">{progress.completedPomodoros} completed</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Focus Streak</span>
          <span className="text-sm text-primary">{progress.streak} days</span>
        </div>
      </div>

      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-primary text-white px-6 py-3 rounded-xl shadow-lg"
          >
            {isBreak ? 'Time for a break!' : 'Great job! Pomodoro complete!'}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  if (isModal) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <div className="bg-white rounded-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {isBreak ? 'Break Time' : 'Focus Time'}
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {timerContent}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {isBreak ? 'Break Time' : 'Focus Time'}
        </h2>
      </div>
      {timerContent}
    </div>
  );
};

export default StudyTimer; 