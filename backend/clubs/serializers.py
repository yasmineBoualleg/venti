from rest_framework import serializers
from .models import Club, ClubRole, ClubMember, Interest, Post

class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ['id', 'name', 'description']

class ClubRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClubRole
        fields = ['id', 'name', 'description', 'permissions']

class ClubMemberSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    role = ClubRoleSerializer()

    class Meta:
        model = ClubMember
        fields = ['id', 'user', 'role', 'joined_at', 'is_active']

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'profile_picture': obj.user.profile.avatar.url if obj.user.profile.avatar else None,
            'level': obj.user.level,
            'level_title': obj.user.level_title if hasattr(obj.user, 'level_title') else None
        }

class ClubSerializer(serializers.ModelSerializer):
    interests = InterestSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = Club
        fields = [
            'id', 'name', 'slug', 'description', 'cover_photo',
            'interests', 'external_links', 'created_at', 'updated_at',
            'is_active', 'member_count', 'is_member', 'user_role'
        ]

    def get_member_count(self, obj):
        return obj.members.count()

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False

    def get_user_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            membership = ClubMember.objects.filter(
                club=obj,
                user=request.user,
                is_active=True
            ).first()
            if membership and membership.role:
                return ClubRoleSerializer(membership.role).data
        return None

class ClubDetailSerializer(ClubSerializer):
    members = ClubMemberSerializer(source='clubmember_set', many=True, read_only=True)
    roles = ClubRoleSerializer(many=True, read_only=True)
    admins = serializers.SerializerMethodField()

    class Meta(ClubSerializer.Meta):
        fields = ClubSerializer.Meta.fields + ['members', 'roles', 'admins']

    def get_admins(self, obj):
        return [{
            'id': admin.id,
            'username': admin.username,
            'email': admin.email,
            'profile_picture': admin.profile.avatar.url if admin.profile.avatar else None
        } for admin in obj.admins.all()]

class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'club', 'author', 'title', 'content',
            'created_at', 'updated_at', 'like_count', 'is_liked'
        ]

    def get_author(self, obj):
        return {
            'id': obj.author.id,
            'username': obj.author.username,
            'profile_picture': obj.author.profile.avatar.url if obj.author.profile.avatar else None,
            'level': obj.author.level
        }

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False 