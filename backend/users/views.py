from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth import get_user_model
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from .models import Profile, CollabRequest, PastCollaboration
from .serializers import (
    UserSerializer, UserCreateSerializer, ProfileSerializer, ProfileUpdateSerializer,
    CollabRequestSerializer, CollabRequestResponseSerializer,
    PastCollaborationSerializer, MatchmakingUserSerializer
)
from .permissions import IsOwnerOrReadOnly
from .authentication import FirebaseAuthentication

User = get_user_model()

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for user discovery."""
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        return User.objects.filter(profile__isnull=False).exclude(id=self.request.user.id)
    
    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        """Get a specific user's profile."""
        user = self.get_object()
        profile = get_object_or_404(Profile, user=user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def collaborations(self, request, pk=None):
        """Get collaboration history with a specific user."""
        other_user = self.get_object()
        collaborations = PastCollaboration.objects.filter(
            Q(user_a=request.user, user_b=other_user) |
            Q(user_a=other_user, user_b=request.user)
        )
        serializer = PastCollaborationSerializer(collaborations, many=True)
        return Response(serializer.data)

class ProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for user profiles."""
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return ProfileUpdateSerializer
        return ProfileSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile."""
        profile = get_object_or_404(Profile, user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_xp(self, request):
        """Add XP to current user's profile."""
        amount = request.data.get('amount', 0)
        if amount <= 0:
            return Response(
                {'error': 'XP amount must be positive'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        profile = get_object_or_404(Profile, user=request.user)
        profile.add_xp(amount)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_badge(self, request):
        """Add a badge to current user's profile."""
        badge = request.data.get('badge')
        if not badge:
            return Response(
                {'error': 'Badge is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        profile = get_object_or_404(Profile, user=request.user)
        profile.add_badge(badge)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

class CollabRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for collaboration requests."""
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CollabRequestSerializer
    
    def get_queryset(self):
        return CollabRequest.objects.filter(
            Q(from_user=self.request.user) | Q(to_user=self.request.user)
        )
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept a collaboration request."""
        collab_request = self.get_object()
        
        if collab_request.to_user != request.user:
            return Response(
                {'error': 'You can only accept requests sent to you'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if collab_request.status != 'pending':
            return Response(
                {'error': 'Request has already been processed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        collab_request.accept()
        serializer = self.get_serializer(collab_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        """Decline a collaboration request."""
        collab_request = self.get_object()
        
        if collab_request.to_user != request.user:
            return Response(
                {'error': 'You can only decline requests sent to you'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if collab_request.status != 'pending':
            return Response(
                {'error': 'Request has already been processed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        collab_request.decline()
        serializer = self.get_serializer(collab_request)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def sent(self, request):
        """Get collaboration requests sent by current user."""
        requests = CollabRequest.objects.filter(from_user=request.user)
        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def received(self, request):
        """Get collaboration requests received by current user."""
        requests = CollabRequest.objects.filter(to_user=request.user)
        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending collaboration requests for current user."""
        requests = CollabRequest.objects.filter(
            to_user=request.user, 
            status='pending'
        )
        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)

class PastCollaborationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for past collaborations."""
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PastCollaborationSerializer
    
    def get_queryset(self):
        return PastCollaboration.objects.filter(
            Q(user_a=self.request.user) | Q(user_b=self.request.user)
        )

class MatchmakingViewSet(viewsets.ViewSet):
    """ViewSet for user matchmaking."""
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def find_matches(self, request):
        """Find matching users based on various criteria."""
        limit = int(request.query_params.get('limit', 10))
        min_score = int(request.query_params.get('min_score', 0))
        
        # Get all users except current user
        users = User.objects.exclude(id=request.user.id)
        
        # Filter users with profiles
        users = users.filter(profile__isnull=False)
        
        # Calculate match scores and filter
        matches = []
        for user in users:
            serializer = MatchmakingUserSerializer(user, context={'request': request})
            data = serializer.data
            if data['match_score'] >= min_score:
                matches.append(data)
        
        # Sort by match score (descending) and limit results
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        matches = matches[:limit]
        
        return Response({
            'matches': matches,
            'total_found': len(matches),
            'user_profile': ProfileSerializer(request.user.profile).data
        })
    
    @action(detail=False, methods=['get'])
    def by_skill(self, request):
        """Find users by specific skill."""
        skill = request.query_params.get('skill')
        if not skill:
            return Response(
                {'error': 'Skill parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        limit = int(request.query_params.get('limit', 10))
        
        # Find users with the specified skill
        users = User.objects.filter(
            profile__skills__contains=[skill]
        ).exclude(id=request.user.id)
        
        matches = []
        for user in users:
            serializer = MatchmakingUserSerializer(user, context={'request': request})
            data = serializer.data
            matches.append(data)
        
        # Sort by match score and limit
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        matches = matches[:limit]
        
        return Response({
            'skill': skill,
            'matches': matches,
            'total_found': len(matches)
        })
    
    @action(detail=False, methods=['get'])
    def by_interest(self, request):
        """Find users by specific interest."""
        interest = request.query_params.get('interest')
        if not interest:
            return Response(
                {'error': 'Interest parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        limit = int(request.query_params.get('limit', 10))
        
        # Find users with the specified interest
        users = User.objects.filter(
            profile__interests__contains=[interest]
        ).exclude(id=request.user.id)
        
        matches = []
        for user in users:
            serializer = MatchmakingUserSerializer(user, context={'request': request})
            data = serializer.data
            matches.append(data)
        
        # Sort by match score and limit
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        matches = matches[:limit]
        
        return Response({
            'interest': interest,
            'matches': matches,
            'total_found': len(matches)
        }) 