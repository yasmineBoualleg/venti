# Venti Logging System

A comprehensive logging system for tracking user activities, program issues, and events with timestamps and detailed context.

## Overview

The logging system provides:
- **Frontend Logging**: Client-side logging with localStorage persistence
- **Backend Logging**: Server-side logging with file output
- **Real-time Tracking**: User activities, errors, performance issues
- **Export Capabilities**: JSON export for analysis
- **Filtering & Search**: Advanced log filtering and search

## Log Levels

### Frontend (TypeScript)
- `INFO`: General information
- `WARNING`: Potential issues
- `ERROR`: Errors and failures
- `DEBUG`: Debug information
- `USER_ACTIVITY`: User interactions
- `SYSTEM`: System events

### Backend (Python)
- `INFO`: General information
- `WARNING`: Potential issues
- `ERROR`: Errors and failures
- `DEBUG`: Debug information

## Log Categories

### User Activities
- `USER_CREATION`: New user registration
- `USER_LOGIN`: User authentication
- `USER_LOGOUT`: User logout
- `USER_PROFILE`: Profile updates

### Authentication
- `AUTHENTICATION`: Login/logout events
- `FIREBASE_LOGIN`: Firebase authentication
- `API_ERROR`: API call failures

### System
- `SYSTEM`: System events
- `PERFORMANCE`: Performance issues
- `MAINTENANCE`: Maintenance tasks

### API
- `API_ERROR`: API failures
- `API_SUCCESS`: Successful API calls

## Frontend Usage

### Basic Logging
```typescript
import logger from '../utils/logger';

// Info log
logger.info('CATEGORY', 'Message', { details: 'data' });

// Warning log
logger.warning('PERFORMANCE', 'Slow response detected', { responseTime: 2500 });

// Error log
logger.error('API_ERROR', 'Failed to fetch data', error);

// User activity
logger.userActivity('USER_LOGIN', 'User logged in', { method: 'google' });
```

### Specialized Methods
```typescript
// User creation
logger.userCreated(userId, userData);

// User login
logger.userLogin(userId, method, success, error);

// User logout
logger.userLogout(userId);

// Authentication errors
logger.authenticationError(error, context);

// API errors
logger.apiError(endpoint, error, userId);

// Performance issues
logger.performanceIssue(component, issue, details);
```

### Log Retrieval
```typescript
// Get all logs
const allLogs = logger.getLogs();

// Filter by level
const errors = logger.getLogs(LogLevel.ERROR);

// Filter by category
const authLogs = logger.getLogs(undefined, 'AUTHENTICATION');

// Filter by user
const userLogs = logger.getLogs(undefined, undefined, userId);

// Get recent logs (last 24 hours)
const recentLogs = logger.getRecentLogs(24);

// Get logs by date range
const dateRangeLogs = logger.getLogsByDateRange(startDate, endDate);
```

### Statistics
```typescript
const stats = logger.getLogStats();
console.log(`Total logs: ${stats.total}`);
console.log(`Recent errors: ${stats.recentErrors}`);
console.log(`User activities: ${stats.recentUserActivities}`);
```

## Backend Usage

### Basic Logging
```python
from utils.logger import logger

# Info log
logger.info('SYSTEM', 'Application started', {'version': '1.0.0'})

# Warning log
logger.warning('PERFORMANCE', 'Database query slow', {'query_time': 2.5})

# Error log
logger.error('API_ERROR', 'Database connection failed', error)

# User activity
logger.user_activity('USER_LOGIN', 'User authenticated', {'user_id': 123})
```

### Specialized Methods
```python
# User creation
logger.user_created(user_id, user_data)

# User login
logger.user_login(user_id, method, success, error)

# User logout
logger.user_logout(user_id)

# Authentication errors
logger.authentication_error(error, context)

# API errors
logger.api_error(endpoint, error, user_id)

# Performance issues
logger.performance_issue(component, issue, details)

# System events
logger.system_event(event, details)

# Security events
logger.security_event(event, details, user_id)

# Database errors
logger.database_error(error, operation, table, user_id)
```

## Log Storage

### Frontend
- **Location**: `localStorage` (browser)
- **Key**: `app_logs`
- **Format**: JSON array of log entries
- **Limit**: 1000 logs (auto-pruned)
- **Persistence**: Survives page reloads

### Backend
- **Location**: `backend/logs/`
- **Files**:
  - `django.log`: General Django logs
  - `django_errors.log`: Error logs only
  - `venti.log`: Application-specific logs
- **Format**: Text with timestamps
- **Rotation**: Manual (configure in settings)

## Log Entry Structure

### Frontend
```typescript
interface LogEntry {
  timestamp: string;        // ISO timestamp
  level: LogLevel;         // Log level
  category: string;        // Log category
  message: string;         // Log message
  details?: any;           // Additional data
  userId?: string;         // Associated user
  sessionId?: string;      // Browser session
  userAgent?: string;      // Browser info
  url?: string;           // Current URL
}
```

### Backend
```python
{
  'timestamp': '2024-01-01T12:00:00Z',
  'level': 'INFO',
  'category': 'USER_LOGIN',
  'message': 'User logged in successfully',
  'details': {'user_id': 123, 'method': 'firebase'},
  'user_id': '123',
  'session_id': 'session_123',
  'ip_address': '192.168.1.1',
  'user_agent': 'Mozilla/5.0...'
}
```

## Configuration

### Frontend
```typescript
// In logger.ts
private maxLogs = 1000;  // Maximum logs to keep
```

### Backend
```python
# In settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'detailed': {
            'format': '[{asctime}] [{levelname}] [{name}] {message}',
            'style': '{',
        },
    },
    'handlers': {
        'venti_file': {
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'venti.log'),
            'formatter': 'detailed',
        },
    },
    'loggers': {
        'venti_logger': {
            'handlers': ['console', 'venti_file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

## Log Analysis

### Common Patterns
1. **User Journey**: Track user from login to logout
2. **Error Clustering**: Group similar errors
3. **Performance Trends**: Monitor response times
4. **Security Events**: Track suspicious activities

### Export & Analysis
```typescript
// Export logs
const logData = logger.exportLogs();
// Save to file or send to analytics service

// Filter for analysis
const userLogs = logger.getLogs(undefined, 'USER_ACTIVITY');
const errorLogs = logger.getLogs(LogLevel.ERROR);
const recentActivity = logger.getRecentLogs(24);
```

## Best Practices

### Frontend
1. **Log User Actions**: Track important user interactions
2. **Error Context**: Include relevant details with errors
3. **Performance Monitoring**: Log slow operations
4. **Privacy**: Don't log sensitive user data
5. **Storage Management**: Monitor localStorage usage

### Backend
1. **Structured Logging**: Use consistent format
2. **Error Handling**: Log all exceptions
3. **Security Events**: Track authentication failures
4. **Performance**: Monitor database queries
5. **File Rotation**: Implement log rotation

### General
1. **Meaningful Messages**: Clear, actionable log messages
2. **Appropriate Levels**: Use correct log levels
3. **Context**: Include relevant metadata
4. **Monitoring**: Set up alerts for critical errors
5. **Retention**: Define log retention policies

## Testing

### Test Page
Visit `/test-logging` to:
- Add sample logs
- Test different log levels
- View log statistics
- Export logs
- Clear logs

### Log Viewer
Visit `/logs` to:
- View all logs
- Filter by level/category
- Search logs
- Export filtered logs

## Integration

### Authentication Flow
```typescript
// Login attempt
logger.userLogin(userId, 'google', true);

// Login success
logger.userActivity('USER_LOGIN', 'Login successful', { method: 'google' });

// Login failure
logger.userLogin('unknown', 'google', false, 'Invalid token');
logger.authenticationError(error, 'google_signin');
```

### API Calls
```typescript
try {
  const response = await api.get('/api/users');
  logger.info('API', 'Users fetched successfully');
} catch (error) {
  logger.apiError('/api/users', error);
}
```

### Performance Monitoring
```typescript
const startTime = performance.now();
// ... operation
const duration = performance.now() - startTime;

if (duration > 1000) {
  logger.performanceIssue('UserProfile', 'Slow render', { duration });
}
```

## Troubleshooting

### Common Issues
1. **Logs Not Appearing**: Check localStorage quota
2. **Performance Impact**: Monitor log volume
3. **Storage Full**: Implement log rotation
4. **Missing Context**: Ensure proper error handling

### Debug Mode
```typescript
// Enable debug logging
if (process.env.NODE_ENV === 'development') {
  logger.debug('DEBUG', 'Debug mode enabled');
}
```

## Future Enhancements

1. **Real-time Logging**: WebSocket-based live log streaming
2. **Log Aggregation**: Centralized log collection
3. **Alerting**: Automated error notifications
4. **Analytics**: Log-based user analytics
5. **Machine Learning**: Anomaly detection in logs 