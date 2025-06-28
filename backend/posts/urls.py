from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet, NotebookViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'notebooks', NotebookViewSet, basename='notebook')

urlpatterns = [
    path('', include(router.urls)),
] 