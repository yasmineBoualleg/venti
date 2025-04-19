from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Profile
from .serializers import UserSerializer, UserCreateSerializer, ProfileSerializer
from django.shortcuts import get_object_or_404

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

class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing User instances."""
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the current user's profile."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_xp(self, request, pk=None):
        """Add XP to a user."""
        user = self.get_object()
        xp_amount = request.data.get('xp', 0)
        
        if not isinstance(xp_amount, (int, float)) or xp_amount <= 0:
            return Response(
                {'error': 'Invalid XP amount'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.add_xp(xp_amount)
        serializer = self.get_serializer(user)
        return Response(serializer.data)

class ProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing Profile instances."""
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the current user's profile."""
        profile = get_object_or_404(Profile, user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data) 