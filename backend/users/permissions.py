from rest_framework import permissions
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow owners of an object to edit it."""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # For User objects
        if isinstance(obj, User):
            return obj == request.user
        # For Profile objects
        elif isinstance(obj, Profile):
            return obj.user == request.user
        
        return False 