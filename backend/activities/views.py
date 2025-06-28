from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Activity
from .serializers import ActivitySerializer

class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing activities.
    Activities can only be created through signals or internal API calls.
    """
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Activity.objects.all()

        # Filter by user if specified
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        # Filter by type if specified
        activity_type = self.request.query_params.get('type', None)
        if activity_type:
            queryset = queryset.filter(type=activity_type)

        # If not requesting a specific user's activities, only show public activities
        if not user_id:
            queryset = queryset.filter(is_public=True)

        # If authenticated, also show private activities for the requesting user
        if self.request.user.is_authenticated:
            queryset = queryset.filter(
                Q(is_public=True) | Q(user=self.request.user)
            )

        return queryset.select_related('user') 