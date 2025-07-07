from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, ProfileViewSet, CollabRequestViewSet, 
    PastCollaborationViewSet, MatchmakingViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'collab-requests', CollabRequestViewSet, basename='collab-request')
router.register(r'past-collaborations', PastCollaborationViewSet, basename='past-collaboration')
router.register(r'matchmaking', MatchmakingViewSet, basename='matchmaking')

urlpatterns = [
    path('', include(router.urls)),
] 