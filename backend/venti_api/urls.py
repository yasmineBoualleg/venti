"""venti_api URL Configuration"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# API URL patterns
api_patterns = [
    path('users/', include('users.urls')),
    path('activities/', include('activities.urls')),
    path('university/', include('university.urls')),
    path('posts/', include('posts.urls')),
]

urlpatterns = [
    # Admin URLs
    path('admin/', admin.site.urls),
    
    # API URLs - all under /api prefix
    path('api/', include(api_patterns)),
    
    # Authentication URLs
    path('api-auth/', include('rest_framework.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 