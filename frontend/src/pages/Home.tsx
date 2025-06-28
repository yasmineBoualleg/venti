import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { Link } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import StudyTimer from '../components/StudyTimer';
import NotebookComponent from '../components/Notebook';
import { useUserData } from '../context/UserDataContext';
import api from '../api/api';

const Home = () => {
  const { user } = useAuth();
  const { progress, getNextLevelXp } = useProgress();
  const { userData, addNotebook } = useUserData();
  const [activeTab, setActiveTab] = useState<'overview' | 'focus'>('overview');
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
  const [showNewNotebookModal, setShowNewNotebookModal] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [newNotebookSubject, setNewNotebookSubject] = useState('');
  const [newNotebookColor, setNewNotebookColor] = useState('#ffffff');
  const [newNotebookIcon, setNewNotebookIcon] = useState('book');
  const [newNotebookType, setNewNotebookType] = useState<'copybook' | 'mindmap' | 'flashcards' | 'study'>('copybook');
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [activeMembers, setActiveMembers] = useState<any[]>([]);

  const notebookIcons = [
    { icon: 'book', label: 'Book' },
    { icon: 'square-root-alt', label: 'Math' },
    { icon: 'atom', label: 'Science' },
    { icon: 'flask', label: 'Chemistry' },
    { icon: 'calculator', label: 'Calculator' },
    { icon: 'pencil-alt', label: 'Notes' },
  ];

  const notebookColors = [
    '#ffffff', '#fef3c7', '#dbeafe', '#d1fae5', '#f3e8ff', '#fee2e2'
  ];

  const notebookTypes = [
    { 
      type: 'copybook', 
      icon: 'book', 
      label: 'Copybook', 
      description: 'Traditional notes with text and images',
      features: ['Text notes', 'Camera capture', 'Image upload', 'Drawing support']
    },
    { 
      type: 'mindmap', 
      icon: 'project-diagram', 
      label: 'Mind Map', 
      description: 'Visual organization of concepts',
      features: ['Visual mapping', 'Connections', 'Hierarchy view']
    },
    { 
      type: 'flashcards', 
      icon: 'layer-group', 
      label: 'Flashcards', 
      description: 'Create and study with flashcards',
      features: ['Card creation', 'Spaced repetition', 'Study modes']
    },
    { 
      type: 'study', 
      icon: 'graduation-cap', 
      label: 'Study Notes', 
      description: 'Structured study materials',
      features: ['Structured notes', 'Quiz generation', 'Progress tracking']
    },
  ];

  const handleCreateNotebook = () => {
    if (newNotebookName && newNotebookSubject) {
      addNotebook({
        title: newNotebookName,
        subject: newNotebookSubject,
        color: newNotebookColor,
        icon: newNotebookIcon,
        type: newNotebookType,
        content: {},
      });
      setShowNewNotebookModal(false);
      setNewNotebookName('');
      setNewNotebookSubject('');
      setNewNotebookColor('#ffffff');
      setNewNotebookIcon('book');
      setNewNotebookType('copybook');
    }
  };

  const nextLevelXp = getNextLevelXp();
  const progressToNextLevel = (progress.totalXp % 1000) / 10;

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCameraPreview(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraPreview(false);
  };

  // Comment: Poll for active members every 10 seconds for real-time updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchMembers = async () => {
      try {
        const res = await api.get('/users/');
        // Comment: Fix for paginated response: use results if present, else use data
        setActiveMembers(prev => {
          const members = Array.isArray(res.data.results) ? res.data.results : Array.isArray(res.data) ? res.data : [];
          if (JSON.stringify(prev) !== JSON.stringify(members)) {
            return members;
          }
          return prev;
        });
      } catch (err) {
        console.error('Error fetching active members:', err);
      }
    };
    fetchMembers();
    interval = setInterval(fetchMembers, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <AuthNavbar />
      <div className="container mx-auto px-4 pt-24">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-gray-600 mt-2">Ready to continue your learning journey?</p>
        </motion.div>

        {/* Active Members Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Active Members</h2>
          <div className="flex flex-wrap gap-4">
            {activeMembers.map(member => (
              <div key={member.id} className="flex items-center gap-2 bg-white/80 rounded-xl px-4 py-2 shadow">
                <img src={member.profile?.avatar || '/default-avatar.png'} alt={member.username} className="w-8 h-8 rounded-full" />
                <span className="font-medium">{member.first_name || member.username}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Level {progress.level}</h2>
                <p className="text-gray-600">{progress.totalXp} XP</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Next Level</p>
                <p className="text-primary font-semibold">{nextLevelXp} XP</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-primary h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-xl transition-colors ${
              activeTab === 'overview'
                ? 'bg-primary text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('focus')}
            className={`px-6 py-2 rounded-xl transition-colors ${
              activeTab === 'focus'
                ? 'bg-primary text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            Focus Mode
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/courses"
                    className="flex items-center p-4 bg-white rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <i className="fas fa-book text-blue-500 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">My Courses</h3>
                      <p className="text-sm text-gray-600">View and manage your courses</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Study Timer */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Smart Study Timer</h2>
                <StudyTimer isModal={false} />
              </div>

              {/* Resource Hub */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Resource Hub</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/notes"
                    className="flex items-center p-4 bg-white rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <i className="fas fa-sticky-note text-purple-500 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Study Notes</h3>
                      <p className="text-sm text-gray-600">Access your notes and flashcards</p>
                    </div>
                  </Link>
                  <Link
                    to="/resources"
                    className="flex items-center p-4 bg-white rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                      <i className="fas fa-file-alt text-yellow-500 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Past Papers</h3>
                      <p className="text-sm text-gray-600">Practice with past exam papers</p>
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Stats and Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Study Stats */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Study Stats</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Focus Time</span>
                      <span>{Math.floor(progress.focusTime / 60)}h {progress.focusTime % 60}m</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${Math.min(100, (progress.focusTime / progress.weeklyGoal) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Study Streak</span>
                      <span>{progress.streak} days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (progress.streak / 7) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Pomodoros</span>
                      <span>{progress.completedPomodoros} completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (progress.completedPomodoros / 100) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Achievements</h2>
                <div className="space-y-3">
                  {progress.achievements.slice(-3).map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-white rounded-xl"
                    >
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                        <i className="fas fa-trophy text-yellow-500"></i>
                      </div>
                      <span className="text-gray-800">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notebooks */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">My Notebooks</h2>
                
                {userData.notebooks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-book text-primary text-2xl"></i>
                </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Notebooks Yet</h3>
                    <p className="text-gray-600 mb-6">Create your first notebook to start organizing your study materials</p>
                    <button
                      onClick={() => setShowNewNotebookModal(true)}
                      className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Create New Notebook
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => setShowNewNotebookModal(true)}
                        className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center"
                      >
                        <i className="fas fa-plus mr-2"></i>
                        New Notebook
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userData.notebooks.map((notebook) => (
                      <motion.div
                        key={notebook.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                          className={`p-4 rounded-xl cursor-pointer transition-shadow ${
                            selectedNotebook === notebook.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                          }`}
                          style={{ backgroundColor: notebook.color }}
                        onClick={() => setSelectedNotebook(notebook.id)}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center mr-3">
                              <i className={`fas fa-${notebook.icon} text-gray-600`}></i>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">{notebook.name}</h3>
                              <p className="text-sm text-gray-600">{notebook.subject}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Focus Mode Timer */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Focus Mode</h2>
                <StudyTimer isModal={false} />
              </div>
            </div>

            {/* Task List */}
            <div>
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Tasks</h2>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-white rounded-xl">
                    <input type="checkbox" className="mr-3" />
                    <span className="text-gray-800">Complete Math Assignment</span>
                  </div>
                  <div className="flex items-center p-3 bg-white rounded-xl">
                    <input type="checkbox" className="mr-3" />
                    <span className="text-gray-800">Review Physics Notes</span>
                  </div>
                  <div className="flex items-center p-3 bg-white rounded-xl">
                    <input type="checkbox" className="mr-3" />
                    <span className="text-gray-800">Prepare for Chemistry Quiz</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* New Notebook Modal */}
      {showNewNotebookModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800">Create New Notebook</h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Notebook Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Choose Notebook Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {notebookTypes.map(({ type, icon, label, description, features }) => (
                    <button
                      key={type}
                      onClick={() => setNewNotebookType(type as any)}
                      className={`p-4 rounded-xl text-left transition-all ${
                        newNotebookType === type
                          ? 'bg-primary/10 ring-2 ring-primary'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                          newNotebookType === type ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          <i className={`fas fa-${icon}`}></i>
                        </div>
                        <h3 className="font-medium text-gray-800">{label}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{description}</p>
                      <div className="flex flex-wrap gap-1">
                        {features.map((feature, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Preview */}
              <AnimatePresence>
                {showCameraPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
                  >
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Take a Photo</h3>
                        <button
                          onClick={stopCamera}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <i className="fas fa-times text-xl"></i>
                        </button>
                      </div>
                      <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 border-4 border-white rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={stopCamera}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            // TODO: Implement photo capture
                            stopCamera();
                          }}
                          className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                        >
                          <i className="fas fa-camera mr-2"></i>
                          Take Photo
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newNotebookName}
                  onChange={(e) => setNewNotebookName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter notebook name"
                />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={newNotebookSubject}
                  onChange={(e) => setNewNotebookSubject(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter subject"
                />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {notebookIcons.map(({ icon, label }) => (
                    <button
                      key={icon}
                      onClick={() => setNewNotebookIcon(icon)}
                        className={`p-2 rounded-lg transition-colors ${
                          newNotebookIcon === icon
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={label}
                      >
                        <i className={`fas fa-${icon}`}></i>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="grid grid-cols-6 gap-2">
                  {notebookColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewNotebookColor(color)}
                        className={`w-8 h-8 rounded-lg transition-transform ${
                          newNotebookColor === color ? 'ring-2 ring-primary scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                </div>

                {/* Camera Button for Copybook Type */}
                {newNotebookType === 'copybook' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quick Capture</label>
                    <button
                      onClick={startCamera}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
                    >
                      <i className="fas fa-camera mr-2"></i>
                      Take a Photo of Your Notes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNewNotebookModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNotebook}
                  disabled={!newNotebookName || !newNotebookSubject}
                  className={`px-4 py-2 rounded-xl transition-colors ${
                    !newNotebookName || !newNotebookSubject
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  Create Notebook
              </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Selected Notebook View */}
      {selectedNotebook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] overflow-hidden"
          >
            <NotebookComponent
              subject={selectedNotebook}
              onClose={() => setSelectedNotebook(null)}
            />
        </motion.div>
        </div>
      )}
    </div>
  );
};

export default Home; 