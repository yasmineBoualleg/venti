from django.shortcuts import render
from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import University
from .serializers import UniversitySerializer

# Create your views here.

class UniversityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing universities.
    """
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'id'

    def get_queryset(self):
        queryset = University.objects.all()
        
        # Search by name or short_name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(short_name__icontains=search)
            )

        return queryset
