from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for the Profile model."""
    class Meta:
        model = Profile
        fields = [
            'avatar', 'bio', 'university', 'graduation_year',
            'major', 'interests', 'location', 'linkedin_url',
            'github_url', 'website', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

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