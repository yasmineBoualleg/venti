import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';

const ChatPage = () => {
  return (
    <div className="min-h-screen bg-light-bg relative overflow-hidden pt-4 pb-20">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Simplified Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />

      {/* Main Content */}
      <div className="relative max-w-4xl mx-auto px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-effect rounded-2xl shadow-lg p-8 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">💬 Chat</h1>
          <p className="text-gray-600 text-lg">Message with other students</p>
          <div className="mt-8 text-gray-500">
            <p>Coming soon...</p>
          </div>
        </motion.div>
      </div>

      <Navigation />
    </div>
  );
};

export default ChatPage; 