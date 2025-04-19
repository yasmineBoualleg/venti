from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UniversityViewSet

router = DefaultRouter()
router.register(r'universities', UniversityViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 