import { useState } from 'react';
import { motion } from 'framer-motion';
import logger, { LogLevel } from '../utils/logger';

const TestLogging = () => {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('TEST');
  const [level, setLevel] = useState<LogLevel>(LogLevel.INFO);
  const [details, setDetails] = useState('');

  const addTestLog = () => {
    const logDetails = details ? JSON.parse(details) : undefined;
    
    switch (level) {
      case LogLevel.INFO:
        logger.info(category, message, logDetails);
        break;
      case LogLevel.WARNING:
        logger.warning(category, message, logDetails);
        break;
      case LogLevel.ERROR:
        logger.error(category, message, logDetails);
        break;
      case LogLevel.DEBUG:
        logger.debug(category, message, logDetails);
        break;
      case LogLevel.USER_ACTIVITY:
        logger.userActivity(category, message, logDetails);
        break;
      case LogLevel.SYSTEM:
        logger.system(category, message, logDetails);
        break;
    }
    
    // Clear form
    setMessage('');
    setDetails('');
  };

  const addSampleLogs = () => {
    // Add various sample logs
    logger.info('SYSTEM', 'Application started', { version: '1.0.0', timestamp: new Date().toISOString() });
    logger.userActivity('USER_LOGIN', 'User logged in successfully', { method: 'google', email: 'test@example.com' });
    logger.warning('PERFORMANCE', 'Slow API response detected', { endpoint: '/api/users', responseTime: 2500 });
    logger.error('API_ERROR', 'Failed to fetch user data', { endpoint: '/api/users/1', status: 500 });
    logger.system('MAINTENANCE', 'Database backup completed', { size: '2.5GB', duration: '5m 30s' });
    logger.debug('DEBUG', 'Component re-rendered', { component: 'UserProfile', props: { userId: 123 } });
  };

  const getLogStats = () => {
    const stats = logger.getLogStats();
    alert(`Log Statistics:\nTotal: ${stats.total}\nErrors: ${stats.byLevel.ERROR}\nWarnings: ${stats.byLevel.WARNING}\nUser Activities: ${stats.byLevel.USER_ACTIVITY}`);
  };

  const exportLogs = () => {
    const logData = logger.exportLogs();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `venti-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg p-8 w-full max-w-2xl"
      >
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Logging Test Page
        </h1>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={addSampleLogs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Sample Logs
            </button>
            <button
              onClick={getLogStats}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View Stats
            </button>
            <button
              onClick={exportLogs}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Export Logs
            </button>
            <button
              onClick={() => logger.clearLogs()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear Logs
            </button>
          </div>

          {/* Custom Log Form */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Add Custom Log</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Log Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as LogLevel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(LogLevel).map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., TEST, API, USER"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter log message"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Details (JSON)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder='{"key": "value"}'
              />
            </div>

            <button
              onClick={addTestLog}
              disabled={!message.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Log
            </button>
          </div>

          {/* Log Examples */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Log Examples</h2>
            
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="bg-white/10 p-3 rounded-lg">
                <strong>User Activity:</strong> User login, logout, profile updates
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <strong>API Errors:</strong> Failed requests, authentication errors
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <strong>Performance:</strong> Slow responses, memory usage
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <strong>System:</strong> App startup, maintenance tasks
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <strong>Debug:</strong> Component renders, state changes
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <a 
              href="/logs" 
              className="text-blue-600 hover:text-blue-800 text-sm underline block"
            >
              View All Logs
            </a>
            <a 
              href="/" 
              className="text-gray-600 hover:text-gray-800 text-sm underline block"
            >
              Back to Home
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TestLogging; 