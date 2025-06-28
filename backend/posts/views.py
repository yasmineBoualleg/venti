from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from .models import Post, Poll, PollOption, Comment, Notebook
from .serializers import PostSerializer, PollSerializer, PollOptionSerializer, CommentSerializer, NotebookSerializer
from rest_framework.permissions import IsAuthenticated

# Create your views here.

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Post.objects.all().order_by('-created_at')
        
        # Filter by club if specified
        club_id = self.request.query_params.get('club', None)
        if club_id:
            queryset = queryset.filter(club_id=club_id)
        
        # Filter by author if specified
        author_id = self.request.query_params.get('author', None)
        if author_id:
            queryset = queryset.filter(author_id=author_id)
        
        # Filter by type if specified
        post_type = self.request.query_params.get('type', None)
        if post_type:
            queryset = queryset.filter(type=post_type)

        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        if post.likes.filter(id=request.user.id).exists():
            post.likes.remove(request.user)
            return Response({'status': 'unliked'})
        else:
            post.likes.add(request.user)
            return Response({'status': 'liked'})

    @action(detail=True, methods=['post'])
    def vote(self, request, pk=None):
        post = self.get_object()
        if not post.poll:
            return Response({'error': 'This post has no poll'}, status=status.HTTP_400_BAD_REQUEST)

        option_ids = request.data.get('options', [])
        if not isinstance(option_ids, list):
            option_ids = [option_ids]

        if not post.poll.is_multiple_choice and len(option_ids) > 1:
            return Response({'error': 'This poll does not allow multiple choices'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Remove previous votes if any
        PollOption.objects.filter(poll=post.poll).filter(votes=request.user).update(votes=None)

        # Add new votes
        for option_id in option_ids:
            option = get_object_or_404(PollOption, id=option_id, poll=post.poll)
            option.votes.add(request.user)

        return Response({'status': 'voted'})

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Comment.objects.filter(parent=None)  # Get only top-level comments
        post_id = self.request.query_params.get('post', None)
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        return queryset

    def perform_create(self, serializer):
        post_id = self.request.data.get('post')
        parent_id = self.request.data.get('parent')
        
        post = get_object_or_404(Post, id=post_id)
        parent = None
        if parent_id:
            parent = get_object_or_404(Comment, id=parent_id)
        
        serializer.save(
            author=self.request.user,
            post=post,
            parent=parent
        )

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        comment = self.get_object()
        if comment.likes.filter(id=request.user.id).exists():
            comment.likes.remove(request.user)
            return Response({'status': 'unliked'})
        else:
            comment.likes.add(request.user)
            return Response({'status': 'liked'})

class NotebookViewSet(viewsets.ModelViewSet):
    serializer_class = NotebookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notebook.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
