from rest_framework import serializers
from .models import Post, Poll, PollOption, Comment, Notebook

class PollOptionSerializer(serializers.ModelSerializer):
    vote_count = serializers.IntegerField(read_only=True)
    has_voted = serializers.SerializerMethodField()

    class Meta:
        model = PollOption
        fields = ['id', 'text', 'vote_count', 'has_voted']

    def get_has_voted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.votes.filter(id=request.user.id).exists()
        return False

class PollSerializer(serializers.ModelSerializer):
    options = PollOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Poll
        fields = ['id', 'question', 'end_date', 'is_multiple_choice', 'options']

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'author', 'content', 'created_at', 'updated_at',
            'like_count', 'is_liked', 'replies'
        ]

    def get_author(self, obj):
        return {
            'id': obj.author.id,
            'username': obj.author.username,
            'profile_picture': obj.author.profile.avatar.url if obj.author.profile.avatar else None,
            'level': obj.author.level if hasattr(obj.author, 'level') else None
        }

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []

class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    club = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    poll = PollSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'club', 'type', 'title', 'content',
            'image', 'created_at', 'updated_at', 'like_count',
            'comment_count', 'is_liked', 'is_pinned', 'is_featured',
            'poll', 'comments'
        ]

    def get_author(self, obj):
        return {
            'id': obj.author.id,
            'username': obj.author.username,
            'profile_picture': obj.author.profile.avatar.url if obj.author.profile.avatar else None,
            'level': obj.author.level if hasattr(obj.author, 'level') else None
        }

    def get_club(self, obj):
        if obj.club:
            return {
                'id': obj.club.id,
                'name': obj.club.name,
                'slug': obj.club.slug,
                'cover_photo': obj.club.cover_photo.url if obj.club.cover_photo else None
            }
        return None

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False 

class NotebookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notebook
        fields = ['id', 'user', 'title', 'content', 'type', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at'] 