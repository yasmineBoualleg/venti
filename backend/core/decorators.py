from functools import wraps
from django.core.cache import cache
from django.db import transaction
from rest_framework.response import Response
from rest_framework import status

def cache_response(timeout=300):
    """
    Cache the response of a view for a specified time.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(self, request, *args, **kwargs):
            # Generate cache key based on request
            key = f"cache_{request.path}_{request.user.id}"
            result = cache.get(key)
            
            if result is None:
                result = view_func(self, request, *args, **kwargs)
                cache.set(key, result, timeout)
            return result
        return _wrapped_view
    return decorator

def track_activity(activity_type):
    """
    Track user activity and award XP.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(self, request, *args, **kwargs):
            response = view_func(self, request, *args, **kwargs)
            
            if response.status_code == status.HTTP_200_OK:
                from core.utils import calculate_xp_for_action
                xp = calculate_xp_for_action(activity_type)
                if xp > 0 and request.user.is_authenticated:
                    request.user.add_xp(xp)
            return response
        return _wrapped_view
    return decorator

def atomic_transaction():
    """
    Ensure view is executed in a database transaction.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(self, request, *args, **kwargs):
            with transaction.atomic():
                return view_func(self, request, *args, **kwargs)
        return _wrapped_view
    return decorator

def validate_request_data(*required_fields):
    """
    Validate that required fields are present in request data.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(self, request, *args, **kwargs):
            missing_fields = [
                field for field in required_fields 
                if field not in request.data
            ]
            if missing_fields:
                return Response(
                    {
                        'error': 'Missing required fields',
                        'fields': missing_fields
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            return view_func(self, request, *args, **kwargs)
        return _wrapped_view
    return decorator 