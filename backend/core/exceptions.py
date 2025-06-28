from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.utils import IntegrityError

def custom_exception_handler(exc, context):
    """
    Custom exception handler for better error responses.
    """
    response = exception_handler(exc, context)

    if response is None:
        if isinstance(exc, DjangoValidationError):
            return Response({
                'error': 'Validation Error',
                'detail': exc.message,
                'code': 'validation_error'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        elif isinstance(exc, IntegrityError):
            return Response({
                'error': 'Database Integrity Error',
                'detail': str(exc),
                'code': 'integrity_error'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'error': 'Internal Server Error',
            'detail': str(exc),
            'code': 'internal_error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response

class VentiException(Exception):
    """
    Base exception for Venti application.
    """
    def __init__(self, message, code=None, status_code=status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.code = code or 'error'
        self.status_code = status_code
        super().__init__(message)

class ResourceNotFoundError(VentiException):
    """
    Exception raised when a requested resource is not found.
    """
    def __init__(self, message="Resource not found", code='not_found'):
        super().__init__(message, code, status.HTTP_404_NOT_FOUND)

class PermissionDeniedError(VentiException):
    """
    Exception raised when user doesn't have permission for an action.
    """
    def __init__(self, message="Permission denied", code='permission_denied'):
        super().__init__(message, code, status.HTTP_403_FORBIDDEN) 