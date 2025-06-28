from rest_framework import serializers
from core.serializers import UserStampedSerializer, LikeableSerializer
from .models import Event, EventParticipant

class EventParticipantSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = EventParticipant
        fields = ['id', 'user', 'status', 'registration_date', 'notes']
        read_only_fields = ['registration_date']

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'profile_picture': obj.user.profile.avatar.url if obj.user.profile.avatar else None
        }

class EventSerializer(UserStampedSerializer, LikeableSerializer):
    organizer = serializers.SerializerMethodField()
    participant_count = serializers.SerializerMethodField()
    is_registered = serializers.SerializerMethodField()
    registration_status = serializers.SerializerMethodField()
    time_status = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'start_date', 'end_date', 'registration_deadline', 'location',
            'is_online', 'meeting_link', 'max_participants', 'status', 'visibility', 'cover_image',
            'participant_count', 'is_registered', 'registration_status', 'time_status', 'is_featured',
            'like_count', 'is_liked', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = [
            'organizer', 'participant_count', 'is_registered',
            'registration_status', 'time_status', 'like_count', 'is_liked'
        ]

    def get_organizer(self, obj):
        return {
            'id': obj.organizer.id,
            'username': obj.organizer.username,
            'profile_picture': obj.organizer.profile.avatar.url if obj.organizer.profile.avatar else None
        }

    def get_participant_count(self, obj):
        return obj.participants.count()

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.participants.filter(id=request.user.id).exists()
        return False

    def get_registration_status(self, obj):
        request = self.context.get('request')
        if not (request and request.user.is_authenticated):
            return None
        try:
            participant = EventParticipant.objects.get(event=obj, user=request.user)
            return participant.status
        except EventParticipant.DoesNotExist:
            return None

    def get_time_status(self, obj):
        if obj.is_past:
            return 'past'
        elif obj.is_ongoing:
            return 'ongoing'
        else:
            return 'upcoming'

class EventDetailSerializer(EventSerializer):
    participants = EventParticipantSerializer(
        source='eventparticipant_set',
        many=True,
        read_only=True
    ) 