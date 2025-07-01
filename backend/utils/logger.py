import logging
import json
import os
from datetime import datetime
from django.conf import settings
from django.core.mail import mail_admins
from django.utils import timezone
from typing import Any, Dict, Optional
import traceback

class CustomLogger:
    """
    Custom logger for tracking user activities, system events, and errors
    """
    
    def __init__(self):
        self.logger = logging.getLogger('venti_logger')
        self.setup_logger()
        
    def setup_logger(self):
        """Setup the logger with proper formatting and handlers"""
        if not self.logger.handlers:
            # Create logs directory if it doesn't exist
            logs_dir = os.path.join(settings.BASE_DIR, 'logs')
            os.makedirs(logs_dir, exist_ok=True)
            
            # Create formatter
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            
            # File handler for all logs
            file_handler = logging.FileHandler(
                os.path.join(logs_dir, 'venti.log')
            )
            file_handler.setLevel(logging.INFO)
            file_handler.setFormatter(formatter)
            
            # File handler for errors only
            error_handler = logging.FileHandler(
                os.path.join(logs_dir, 'errors.log')
            )
            error_handler.setLevel(logging.ERROR)
            error_handler.setFormatter(formatter)
            
            # Console handler for development
            if settings.DEBUG:
                console_handler = logging.StreamHandler()
                console_handler.setLevel(logging.DEBUG)
                console_handler.setFormatter(formatter)
                self.logger.addHandler(console_handler)
            
            self.logger.addHandler(file_handler)
            self.logger.addHandler(error_handler)
            self.logger.setLevel(logging.INFO)
    
    def _format_log_data(self, category: str, message: str, details: Optional[Dict] = None, 
                        user_id: Optional[str] = None, request=None) -> Dict[str, Any]:
        """Format log data with consistent structure"""
        log_data = {
            'timestamp': timezone.now().isoformat(),
            'category': category,
            'message': message,
            'details': details or {},
            'user_id': user_id,
        }
        
        if request:
            log_data.update({
                'ip_address': self._get_client_ip(request),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'url': request.build_absolute_uri(),
                'method': request.method,
            })
            
            if hasattr(request, 'user') and request.user.is_authenticated:
                log_data['user_id'] = str(request.user.id)
                log_data['user_email'] = request.user.email
        
        return log_data
    
    def _get_client_ip(self, request) -> str:
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _log(self, level: str, category: str, message: str, details: Optional[Dict] = None,
             user_id: Optional[str] = None, request=None, notify_admin: bool = False):
        """Internal logging method"""
        log_data = self._format_log_data(category, message, details, user_id, request)
        
        # Log to file
        log_message = f"[{category}] {message}"
        if details:
            log_message += f" | Details: {json.dumps(details)}"
        
        if level == 'ERROR':
            self.logger.error(log_message)
        elif level == 'WARNING':
            self.logger.warning(log_message)
        elif level == 'INFO':
            self.logger.info(log_message)
        elif level == 'DEBUG':
            self.logger.debug(log_message)
        
        # Notify admin for critical errors
        if notify_admin and level == 'ERROR':
            self._notify_admin(log_data)
    
    def _notify_admin(self, log_data: Dict[str, Any]):
        """Send email notification to admin for critical errors"""
        try:
            subject = f"Venti Error Alert: {log_data['category']}"
            message = f"""
Critical error detected in Venti application:

Category: {log_data['category']}
Message: {log_data['message']}
Timestamp: {log_data['timestamp']}
User ID: {log_data.get('user_id', 'N/A')}
URL: {log_data.get('url', 'N/A')}
IP Address: {log_data.get('ip_address', 'N/A')}

Details: {json.dumps(log_data['details'], indent=2)}
            """
            mail_admins(subject, message)
        except Exception as e:
            # Fallback to console if email fails
            print(f"Failed to send admin notification: {e}")
    
    # Public logging methods
    def info(self, category: str, message: str, details: Optional[Dict] = None,
             user_id: Optional[str] = None, request=None):
        """Log informational message"""
        self._log('INFO', category, message, details, user_id, request)
    
    def warning(self, category: str, message: str, details: Optional[Dict] = None,
                user_id: Optional[str] = None, request=None):
        """Log warning message"""
        self._log('WARNING', category, message, details, user_id, request)
    
    def error(self, category: str, message: str, details: Optional[Dict] = None,
              user_id: Optional[str] = None, request=None, notify_admin: bool = False):
        """Log error message"""
        self._log('ERROR', category, message, details, user_id, request, notify_admin)
    
    def debug(self, category: str, message: str, details: Optional[Dict] = None,
              user_id: Optional[str] = None, request=None):
        """Log debug message"""
        self._log('DEBUG', category, message, details, user_id, request)
    
    # User-specific logging methods
    def user_created(self, user_data: Dict[str, Any], request=None):
        """Log user creation"""
        self.info('USER_CREATION', 'New user created', {
            'user_id': str(user_data.get('id')),
            'email': user_data.get('email'),
            'username': user_data.get('username'),
            'first_name': user_data.get('first_name'),
            'last_name': user_data.get('last_name'),
            'firebase_uid': user_data.get('firebase_uid')
        }, str(user_data.get('id')), request)
    
    def user_login(self, user_id: str, method: str, success: bool, 
                   error: Optional[str] = None, request=None):
        """Log user login attempt"""
        details = {
            'method': method,
            'success': success,
            'timestamp': timezone.now().isoformat()
        }
        if error:
            details['error'] = error
        
        level = 'ERROR' if not success else 'INFO'
        category = 'USER_LOGIN'
        message = f"User login attempt via {method}"
        
        self._log(level, category, message, details, user_id, request)
    
    def user_logout(self, user_id: str, request=None):
        """Log user logout"""
        self.info('USER_LOGOUT', 'User logged out', {
            'timestamp': timezone.now().isoformat()
        }, user_id, request)
    
    def authentication_error(self, error: Exception, context: str, request=None):
        """Log authentication errors"""
        self.error('AUTHENTICATION', f'Authentication error in {context}', {
            'error_type': type(error).__name__,
            'error_message': str(error),
            'context': context,
            'traceback': traceback.format_exc()
        }, request=request, notify_admin=True)
    
    def api_error(self, endpoint: str, error: Exception, user_id: Optional[str] = None, 
                  request=None):
        """Log API errors"""
        self.error('API_ERROR', f'API call failed: {endpoint}', {
            'endpoint': endpoint,
            'error_type': type(error).__name__,
            'error_message': str(error),
            'traceback': traceback.format_exc()
        }, user_id, request)
    
    def firebase_error(self, error: Exception, context: str, user_id: Optional[str] = None,
                       request=None):
        """Log Firebase-related errors"""
        self.error('FIREBASE_ERROR', f'Firebase error in {context}', {
            'error_type': type(error).__name__,
            'error_message': str(error),
            'context': context,
            'traceback': traceback.format_exc()
        }, user_id, request, notify_admin=True)
    
    def performance_issue(self, component: str, issue: str, details: Optional[Dict] = None,
                         request=None):
        """Log performance issues"""
        self.warning('PERFORMANCE', f'Performance issue in {component}: {issue}', {
            'component': component,
            'issue': issue,
            'details': details or {}
        }, request=request)
    
    def system_event(self, event: str, details: Optional[Dict] = None, request=None):
        """Log system events"""
        self.info('SYSTEM', f'System event: {event}', details, request=request)
    
    def security_event(self, event: str, details: Optional[Dict] = None, 
                       user_id: Optional[str] = None, request=None):
        """Log security-related events"""
        self.warning('SECURITY', f'Security event: {event}', details, user_id, request)
    
    def database_error(self, error: Exception, operation: str, table: str = None,
                       user_id: Optional[str] = None, request=None):
        """Log database errors"""
        self.error('DATABASE_ERROR', f'Database error during {operation}', {
            'operation': operation,
            'table': table,
            'error_type': type(error).__name__,
            'error_message': str(error),
            'traceback': traceback.format_exc()
        }, user_id, request, notify_admin=True)

# Create singleton instance
logger = CustomLogger() 