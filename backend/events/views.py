from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from core.permissions import IsCreatorOrReadOnly, IsClubAdminOrReadOnly
from core.mixins import LikeableMixin
from .models import Event, EventParticipant
from .serializers import EventSerializer, EventDetailSerializer, EventParticipantSerializer

class EventViewSet(LikeableMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing events.
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsCreatorOrReadOnly]

    def get_queryset(self):
        queryset = Event.objects.all()
        
        # Filter by club
        club_id = self.request.query_params.get('club', None)
        if club_id:
            queryset = queryset.filter(club_id=club_id)

        # Filter by organizer
        organizer_id = self.request.query_params.get('organizer', None)
        if organizer_id:
            queryset = queryset.filter(organizer_id=organizer_id)

        # Filter by status
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)

        # Filter by time
        time_filter = self.request.query_params.get('time', None)
        now = timezone.now()
        if time_filter == 'upcoming':
            queryset = queryset.filter(start_date__gt=now)
        elif time_filter == 'ongoing':
            queryset = queryset.filter(start_date__lte=now, end_date__gte=now)
        elif time_filter == 'past':
            queryset = queryset.filter(end_date__lt=now)

        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(location__icontains=search)
            )

        # Filter by visibility
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(visibility='PUBLIC')
        else:
            # Show all public events and events from clubs where user is a member
            queryset = queryset.filter(
                Q(visibility='PUBLIC') |
                (Q(visibility='CLUB_MEMBERS') & Q(club__members=self.request.user)) |
                (Q(visibility='PRIVATE') & (
                    Q(organizer=self.request.user) |
                    Q(club__admins=self.request.user)
                ))
            ).distinct()

        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EventDetailSerializer
        return EventSerializer

    def perform_create(self, serializer):
        serializer.save(
            organizer=self.request.user,
            created_by=self.request.user,
            updated_by=self.request.user
        )

    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        event = self.get_object()
        user = request.user

        # Check if registration is still open
        if not event.can_register:
            return Response(
                {'error': 'Registration is closed for this event'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user is already registered
        if EventParticipant.objects.filter(event=event, user=user).exists():
            return Response(
                {'error': 'You are already registered for this event'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if event is full
        if event.max_participants and event.participants.count() >= event.max_participants:
            # Add to waitlist
            participant = EventParticipant.objects.create(
                event=event,
                user=user,
                status='WAITLISTED'
            )
        else:
            # Register normally
            participant = EventParticipant.objects.create(
                event=event,
                user=user,
                status='REGISTERED'
            )

        serializer = EventParticipantSerializer(participant)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel_registration(self, request, pk=None):
        event = self.get_object()
        try:
            participant = EventParticipant.objects.get(event=event, user=request.user)
            participant.status = 'CANCELLED'
            participant.save()

            # If there's a waitlist and space available, move someone from waitlist to registered
            if event.max_participants:
                registered_count = event.participants.filter(
                    eventparticipant__status='REGISTERED'
                ).count()
                if registered_count < event.max_participants:
                    waitlisted = EventParticipant.objects.filter(
                        event=event,
                        status='WAITLISTED'
                    ).first()
                    if waitlisted:
                        waitlisted.status = 'REGISTERED'
                        waitlisted.save()

            return Response({'status': 'registration cancelled'})
        except EventParticipant.DoesNotExist:
            return Response(
                {'error': 'You are not registered for this event'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def mark_attendance(self, request, pk=None):
        event = self.get_object()
        
        # Check if user has permission to mark attendance
        if not (request.user == event.organizer or 
                event.club.admins.filter(id=request.user.id).exists()):
            return Response(
                {'error': 'You do not have permission to mark attendance'},
                status=status.HTTP_403_FORBIDDEN
            )

        user_id = request.data.get('user_id')
        try:
            participant = EventParticipant.objects.get(event=event, user_id=user_id)
            participant.status = 'ATTENDED'
            participant.save()
            return Response({'status': 'attendance marked'})
        except EventParticipant.DoesNotExist:
            return Response(
                {'error': 'User is not registered for this event'},
                status=status.HTTP_400_BAD_REQUEST
            ) 