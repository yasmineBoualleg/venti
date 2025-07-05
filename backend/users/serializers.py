from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, CollabRequest, PastCollaboration
import base64
from django.core.files.base import ContentFile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model."""
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'date_joined', 'last_login', 'firebase_uid', 'place'
        ]
        read_only_fields = ['date_joined', 'last_login', 'firebase_uid']

class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users via Firebase."""
    
    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name', 'firebase_uid', 'place']
        read_only_fields = ['firebase_uid']
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user 

class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profiles."""
    user = UserSerializer(read_only=True)
    skill_levels = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'xp', 'skills', 'interests', 'hobbies', 'bio',
            'profile_image', 'badges', 'skill_levels', 'created_at', 'updated_at',
            'show_email'
        ]
        read_only_fields = ['xp', 'badges', 'created_at', 'updated_at']
    
    def get_skill_levels(self, obj):
        """Get skill levels for each skill."""
        skill_levels = {}
        for skill in obj.skills:
            skill_levels[skill] = obj.get_skill_level(skill)
        return skill_levels

class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profiles."""
    profile_image = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Profile
        fields = ['skills', 'interests', 'hobbies', 'bio', 'profile_image']
    
    def validate_skills(self, value):
        """Validate skills list."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Skills must be a list")
        return [skill.strip() for skill in value if skill.strip()]
    
    def validate_interests(self, value):
        """Validate interests list."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Interests must be a list")
        return [interest.strip() for interest in value if interest.strip()]
    
    def validate_hobbies(self, value):
        """Validate hobbies list."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Hobbies must be a list")
        return [hobby.strip() for hobby in value if hobby.strip()]
    
    def validate_profile_image(self, value):
        """Validate and process profile image."""
        if not value:
            return None
        
        # Check if it's a base64 encoded image
        if value.startswith('data:image'):
            try:
                # Extract the base64 data
                format, imgstr = value.split(';base64,')
                ext = format.split('/')[-1]
                
                # Generate filename
                filename = f"profile_image_{self.instance.user.id}.{ext}"
                
                # Convert base64 to file
                data = ContentFile(base64.b64decode(imgstr), name=filename)
                return data
            except Exception as e:
                raise serializers.ValidationError(f"Invalid image format: {str(e)}")
        
        return value

class CollabRequestSerializer(serializers.ModelSerializer):
    """Serializer for collaboration requests."""
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)
    to_user_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = CollabRequest
        fields = [
            'id', 'from_user', 'to_user', 'to_user_id', 'message', 'skill_focus',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['from_user', 'status', 'created_at', 'updated_at']
    
    def validate_to_user_id(self, value):
        """Validate that the target user exists and is not the same as the sender."""
        request = self.context.get('request')
        if request and request.user.id == value:
            raise serializers.ValidationError("You cannot send a collaboration request to yourself")
        
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Target user does not exist")
        
        return value
    
    def create(self, validated_data):
        """Create a new collaboration request."""
        request = self.context.get('request')
        validated_data['from_user'] = request.user
        validated_data['to_user_id'] = validated_data.pop('to_user_id')
        return super().create(validated_data)

class CollabRequestResponseSerializer(serializers.ModelSerializer):
    """Serializer for responding to collaboration requests."""
    
    class Meta:
        model = CollabRequest
        fields = ['status']
    
    def validate_status(self, value):
        """Validate status change."""
        if value not in ['accepted', 'declined']:
            raise serializers.ValidationError("Status must be 'accepted' or 'declined'")
        return value

class PastCollaborationSerializer(serializers.ModelSerializer):
    """Serializer for past collaborations."""
    user_a = UserSerializer(read_only=True)
    user_b = UserSerializer(read_only=True)
    
    class Meta:
        model = PastCollaboration
        fields = ['id', 'user_a', 'user_b', 'skill_used', 'collab_type', 'timestamp']

class MatchmakingUserSerializer(serializers.ModelSerializer):
    """Serializer for matchmaking results."""
    profile = ProfileSerializer(read_only=True)
    shared_interests_count = serializers.SerializerMethodField()
    shared_skills_count = serializers.SerializerMethodField()
    collaboration_count = serializers.SerializerMethodField()
    match_score = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'place',
            'profile', 'shared_interests_count', 'shared_skills_count',
            'collaboration_count', 'match_score'
        ]
    
    def get_shared_interests_count(self, obj):
        """Get count of shared interests with current user."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        
        current_interests = set(request.user.profile.interests)
        user_interests = set(obj.profile.interests)
        return len(current_interests.intersection(user_interests))
    
    def get_shared_skills_count(self, obj):
        """Get count of shared skills with current user."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        
        current_skills = set(request.user.profile.skills)
        user_skills = set(obj.profile.skills)
        return len(current_skills.intersection(user_skills))
    
    def get_collaboration_count(self, obj):
        """Get count of past collaborations with current user."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        
        return PastCollaboration.get_collaboration_count(request.user, obj)
    
    def get_match_score(self, obj):
        """Calculate match score based on various factors."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        
        score = 0
        
        # Shared interests (weight: 3)
        shared_interests = self.get_shared_interests_count(obj)
        score += shared_interests * 3
        
        # Shared skills (weight: 2)
        shared_skills = self.get_shared_skills_count(obj)
        score += shared_skills * 2
        
        # Past collaborations (weight: 5)
        collab_count = self.get_collaboration_count(obj)
        score += collab_count * 5
        
        # XP level similarity (weight: 1)
        xp_diff = abs(request.user.profile.xp - obj.profile.xp)
        if xp_diff < 100:
            score += 2
        elif xp_diff < 500:
            score += 1
        
        return score 