// Logger utility for tracking user activities, program issues, and events
export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
  USER_ACTIVITY = 'USER_ACTIVITY',
  SYSTEM = 'SYSTEM'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  details?: any;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadLogsFromStorage();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  private getUserAgent(): string {
    return navigator.userAgent;
  }

  private getCurrentUrl(): string {
    return window.location.href;
  }

  private addLog(level: LogLevel, category: string, message: string, details?: any, userId?: string): void {
    const logEntry: LogEntry = {
      timestamp: this.getCurrentTimestamp(),
      level,
      category,
      message,
      details,
      userId,
      sessionId: this.sessionId,
      userAgent: this.getUserAgent(),
      url: this.getCurrentUrl()
    };

    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Save to localStorage
    this.saveLogsToStorage();

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === LogLevel.ERROR ? 'error' : 
                           level === LogLevel.WARNING ? 'warn' : 'log';
      console[consoleMethod](`[${level}] [${category}] ${message}`, details || '');
    }
  }

  private saveLogsToStorage(): void {
    try {
      localStorage.setItem('app_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save logs to localStorage:', error);
    }
  }

  private loadLogsFromStorage(): void {
    try {
      const storedLogs = localStorage.getItem('app_logs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      console.error('Failed to load logs from localStorage:', error);
    }
  }

  // Public logging methods
  info(category: string, message: string, details?: any, userId?: string): void {
    this.addLog(LogLevel.INFO, category, message, details, userId);
  }

  warning(category: string, message: string, details?: any, userId?: string): void {
    this.addLog(LogLevel.WARNING, category, message, details, userId);
  }

  error(category: string, message: string, details?: any, userId?: string): void {
    this.addLog(LogLevel.ERROR, category, message, details, userId);
  }

  debug(category: string, message: string, details?: any, userId?: string): void {
    this.addLog(LogLevel.DEBUG, category, message, details, userId);
  }

  userActivity(category: string, message: string, details?: any, userId?: string): void {
    this.addLog(LogLevel.USER_ACTIVITY, category, message, details, userId);
  }

  system(category: string, message: string, details?: any, userId?: string): void {
    this.addLog(LogLevel.SYSTEM, category, message, details, userId);
  }

  // User-specific logging methods
  userCreated(userId: string, userData: any): void {
    this.userActivity('USER_CREATION', 'New user created', {
      userId,
      email: userData.email,
      username: userData.username,
      firstName: userData.first_name,
      lastName: userData.last_name
    }, userId);
  }

  userLogin(userId: string, method: string, success: boolean, error?: string): void {
    this.userActivity('USER_LOGIN', `User login attempt via ${method}`, {
      userId,
      method,
      success,
      error,
      timestamp: new Date().toISOString()
    }, userId);
  }

  userLogout(userId: string): void {
    this.userActivity('USER_LOGOUT', 'User logged out', {
      userId,
      timestamp: new Date().toISOString()
    }, userId);
  }

  authenticationError(error: any, context: string): void {
    this.error('AUTHENTICATION', `Authentication error in ${context}`, {
      error: error.message || error,
      code: error.code,
      context,
      timestamp: new Date().toISOString()
    });
  }

  apiError(endpoint: string, error: any, userId?: string): void {
    this.error('API_ERROR', `API call failed: ${endpoint}`, {
      endpoint,
      error: error.message || error,
      status: error.response?.status,
      data: error.response?.data,
      timestamp: new Date().toISOString()
    }, userId);
  }

  performanceIssue(component: string, issue: string, details?: any): void {
    this.warning('PERFORMANCE', `Performance issue in ${component}: ${issue}`, {
      component,
      issue,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Get logs with filtering
  getLogs(level?: LogLevel, category?: string, userId?: string, limit?: number): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs;
  }

  // Get logs by date range
  getLogsByDateRange(startDate: Date, endDate: Date): LogEntry[] {
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  // Get recent logs
  getRecentLogs(hours: number = 24): LogEntry[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.logs.filter(log => new Date(log.timestamp) >= cutoffTime);
  }

  // Export logs
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('app_logs');
  }

  // Get log statistics
  getLogStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<string, number>;
    recentErrors: number;
    recentUserActivities: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const byLevel = Object.values(LogLevel).reduce((acc, level) => {
      acc[level] = this.logs.filter(log => log.level === level).length;
      return acc;
    }, {} as Record<LogLevel, number>);

    const byCategory = this.logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentErrors = this.logs.filter(log => 
      log.level === LogLevel.ERROR && new Date(log.timestamp) >= oneHourAgo
    ).length;

    const recentUserActivities = this.logs.filter(log => 
      log.level === LogLevel.USER_ACTIVITY && new Date(log.timestamp) >= oneHourAgo
    ).length;

    return {
      total: this.logs.length,
      byLevel,
      byCategory,
      recentErrors,
      recentUserActivities
    };
  }
}

// Create singleton instance
const logger = new Logger();

export default logger; 