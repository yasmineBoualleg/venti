from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClubViewSet, InterestViewSet, PostViewSet

router = DefaultRouter()
router.register(r'clubs', ClubViewSet)
router.register(r'interests', InterestViewSet)
router.register(r'posts', PostViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 