from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Profile
from .serializers import UserSerializer, UserCreateSerializer, ProfileSerializer
from django.shortcuts import get_object_or_404
from .permissions import IsOwnerOrReadOnly

User = get_user_model()

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
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the current user's profile (create if missing)."""
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    

    @action(detail=True, methods=['post'])
    def follow(self, request, pk=None):
        """Follow a user."""
        profile = self.get_object()
        if profile.user == request.user:
            return Response(
                {'error': 'You cannot follow yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        request.user.following.add(profile.user)
        return Response({'status': 'following'})

    @action(detail=True, methods=['post'])
    def unfollow(self, request, pk=None):
        """Unfollow a user."""
        profile = self.get_object()
        request.user.following.remove(profile.user)
        return Response({'status': 'unfollowed'})

    @action(detail=True, methods=['get'])
    def followers(self, request, pk=None):
        """Get a user's followers."""
        profile = self.get_object()
        followers = profile.user.followers.all()
        return Response({
            'followers': [
                {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'profile_picture': user.profile.avatar.url if user.profile.avatar else None
                }
                for user in followers
            ]
        })

    @action(detail=True, methods=['get'])
    def following(self, request, pk=None):
        """Get users that a user is following."""
        profile = self.get_object()
        following = profile.user.following.all()
        return Response({
            'following': [
                {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'profile_picture': user.profile.avatar.url if user.profile.avatar else None
                }
                for user in following
            ]
        }) 