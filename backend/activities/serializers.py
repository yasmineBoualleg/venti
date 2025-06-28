from rest_framework import serializers
from .models import Activity

class ActivitySerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    activity_text = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            'id', 'user', 'type', 'target_id', 'target_type',
            'data', 'created_at', 'is_public', 'activity_text'
        ]
        read_only_fields = ['user', 'activity_text']

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'profile_picture': obj.user.profile.avatar.url if obj.user.profile.avatar else None,
            'level': obj.user.level if hasattr(obj.user, 'level') else None
        }

    def get_activity_text(self, obj):
        """Generate a human-readable description of the activity."""
        activity_type = obj.get_type_display()
        data = obj.data or {}
        
        if obj.type == 'JOIN_CLUB' and obj.club:
            return f"joined {obj.club.name}"
        elif obj.type == 'CREATE_POST':
            return f"created a post: {data.get('post_title', '')}"
        elif obj.type == 'COMMENT':
            return f"commented on a post"
        elif obj.type == 'LIKE_POST':
            return f"liked a post"
        elif obj.type == 'LIKE_COMMENT':
            return f"liked a comment"
        elif obj.type == 'VOTE_POLL':
            return f"voted on a poll"
        elif obj.type == 'ACHIEVEMENT':
            return f"earned the achievement: {data.get('achievement_name', '')}"
        elif obj.type == 'LEVEL_UP':
            return f"reached level {data.get('new_level', '')}"
        elif obj.type == 'UPDATE_PROFILE':
            return f"updated their profile"
        elif obj.type == 'CREATE_CLUB':
            return f"created a new club: {obj.club.name if obj.club else ''}"
        
        return activity_type 