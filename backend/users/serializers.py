from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for the Profile model."""
    user = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    clubs_count = serializers.SerializerMethodField()
    events_attended = serializers.SerializerMethodField()
    xp = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'avatar', 'bio', 'university', 'graduation_year',
            'major', 'interests', 'location', 'linkedin_url', 'github_url',
            'website', 'created_at', 'updated_at', 'is_admin',
            'followers_count', 'following_count', 'clubs_count',
            'events_attended', 'xp'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name
        }

    def get_is_admin(self, obj):
        return obj.user.is_staff or obj.user.is_superuser

    def get_followers_count(self, obj):
        return obj.user.followers.count()

    def get_following_count(self, obj):
        return obj.user.following.count()

    def get_clubs_count(self, obj):
        return obj.user.clubmember_set.count()

    def get_events_attended(self, obj):
        return obj.user.eventattendance_set.count()

    def get_xp(self, obj):
        # Calculate XP based on various activities
        xp = 0
        # Base XP for profile completion
        xp += 100 if obj.bio else 0
        xp += 50 if obj.university else 0
        xp += 50 if obj.major else 0
        xp += 25 if obj.location else 0
        # XP for social connections
        xp += obj.user.followers.count() * 10
        xp += obj.user.following.count() * 5
        # XP for club participation
        xp += obj.user.clubmember_set.count() * 50
        # XP for event attendance
        xp += obj.user.eventattendance_set.count() * 25
        return xp

class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model."""
    profile = ProfileSerializer()
    level_progress = serializers.FloatField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'level', 'xp', 'xp_to_next_level', 'level_progress',
            'profile', 'date_joined', 'last_login'
        ]
        read_only_fields = ['level', 'xp', 'xp_to_next_level', 'date_joined', 'last_login']
    
    def update(self, instance, validated_data):
        """Handle nested profile updates."""
        profile_data = validated_data.pop('profile', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update profile fields
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
            
        return instance

class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users."""
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'first_name', 'last_name']
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user 