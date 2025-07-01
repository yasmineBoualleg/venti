// Simple test for logger functionality
import logger, { LogLevel } from './logger';

// Test basic logging
console.log('Testing logger...');

logger.info('TEST', 'This is a test info log');
logger.warning('TEST', 'This is a test warning log');
logger.error('TEST', 'This is a test error log');
logger.userActivity('TEST', 'This is a test user activity log');

// Test user-specific methods
logger.userCreated('test_user_123', {
  email: 'test@example.com',
  username: 'testuser',
  first_name: 'Test',
  last_name: 'User'
});

logger.userLogin('test_user_123', 'google', true);

// Test error logging
logger.authenticationError(new Error('Test authentication error'), 'test_context');

logger.apiError('/api/test', new Error('Test API error'), 'test_user_123');

// Test performance logging
logger.performanceIssue('TestComponent', 'Slow render detected', { duration: 1500 });

// Test log retrieval
const allLogs = logger.getLogs();
console.log('Total logs:', allLogs.length);

const errorLogs = logger.getLogs(LogLevel.ERROR);
console.log('Error logs:', errorLogs.length);

const stats = logger.getLogStats();
console.log('Log stats:', stats);

console.log('Logger test completed!'); 