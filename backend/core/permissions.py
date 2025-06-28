from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user

class IsCreatorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow creators of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by == request.user

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow administrators to edit it.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

class IsUniversityAdminOrReadOnly(permissions.BasePermission):
    """
    Allow university admins to manage university-wide content.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_staff

class IsEventOrganizerOrReadOnly(permissions.BasePermission):
    """
    Allow event organizers to manage their events.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.organizer == request.user or obj.club.is_admin(request.user) 