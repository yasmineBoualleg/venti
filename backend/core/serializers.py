from rest_framework import serializers

class TimeStampedSerializer(serializers.ModelSerializer):
    """
    Base serializer for models inheriting from TimeStampedModel.
    """
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class UserStampedSerializer(TimeStampedSerializer):
    """
    Base serializer for models inheriting from UserStampedModel.
    """
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    updated_by = serializers.PrimaryKeyRelatedField(read_only=True)

class LikeableSerializer(serializers.ModelSerializer):
    """
    Base serializer for models with like functionality.
    """
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False 