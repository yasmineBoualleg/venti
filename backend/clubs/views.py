from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Club, ClubRole, ClubMember, Interest, Post
from .serializers import (
    ClubSerializer, ClubDetailSerializer, ClubRoleSerializer,
    ClubMemberSerializer, InterestSerializer, PostSerializer
)

class IsClubAdminOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow club admins to edit."""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.admins.filter(id=request.user.id).exists()

class IsClubMemberOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow club members to create content."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        club_id = request.data.get('club') or request.query_params.get('club')
        if club_id:
            return ClubMember.objects.filter(
                club_id=club_id,
                user=request.user,
                is_active=True
            ).exists()
        return False

class ClubViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing clubs."""
    queryset = Club.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsClubAdminOrReadOnly]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ClubDetailSerializer
        return ClubSerializer

    def perform_create(self, serializer):
        club = serializer.save()
        club.admins.add(self.request.user)
        ClubMember.objects.create(
            user=self.request.user,
            club=club,
            is_active=True
        )

    @action(detail=True, methods=['post'])
    def join(self, request, slug=None):
        """Join a club."""
        club = self.get_object()
        if ClubMember.objects.filter(user=request.user, club=club).exists():
            return Response(
                {'detail': 'Already a member of this club.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ClubMember.objects.create(
            user=request.user,
            club=club,
            is_active=True
        )
        return Response({'detail': 'Successfully joined the club.'})

    @action(detail=True, methods=['post'])
    def leave(self, request, slug=None):
        """Leave a club."""
        club = self.get_object()
        membership = get_object_or_404(ClubMember, user=request.user, club=club)
        
        if club.admins.filter(id=request.user.id).exists():
            if club.admins.count() == 1:
                return Response(
                    {'detail': 'Cannot leave club as you are the only admin.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            club.admins.remove(request.user)
        
        membership.delete()
        return Response({'detail': 'Successfully left the club.'})

    @action(detail=True, methods=['post'])
    def assign_role(self, request, slug=None):
        """Assign a role to a club member."""
        club = self.get_object()
        if not club.admins.filter(id=request.user.id).exists():
            return Response(
                {'detail': 'Only club admins can assign roles.'},
                status=status.HTTP_403_FORBIDDEN
            )

        user_id = request.data.get('user_id')
        role_id = request.data.get('role_id')
        
        membership = get_object_or_404(ClubMember, user_id=user_id, club=club)
        role = get_object_or_404(ClubRole, id=role_id, club=club)
        
        membership.role = role
        membership.save()
        
        return Response(ClubMemberSerializer(membership).data)

class InterestViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing interests."""
    queryset = Interest.objects.all()
    serializer_class = InterestSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class PostViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing posts."""
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsClubMemberOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Toggle like on a post."""
        post = self.get_object()
        if post.likes.filter(id=request.user.id).exists():
            post.likes.remove(request.user)
            return Response({'detail': 'Post unliked.'})
        else:
            post.likes.add(request.user)
            return Response({'detail': 'Post liked.'})

    def get_queryset(self):
        """Filter posts by club or search query."""
        queryset = Post.objects.all()
        club = self.request.query_params.get('club', None)
        search = self.request.query_params.get('search', None)
        
        if club:
            queryset = queryset.filter(club__slug=club)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search)
            )
        return queryset 