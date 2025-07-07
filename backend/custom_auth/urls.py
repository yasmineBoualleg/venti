from django.urls import path
from . import views

urlpatterns = [
    path('firebase-login/', views.firebase_login, name='firebase_login'),
    path('user/', views.get_current_user, name='get_current_user'),
    path('logout/', views.logout, name='logout'),
    path('debug-token/', views.debug_firebase_token, name='debug_firebase_token'),
] 