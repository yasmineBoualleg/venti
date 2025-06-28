from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Profile
from .serializers import UserSerializer, UserCreateSerializer, ProfileSerializer
from django.shortcuts import get_object_or_404
from .permissions import IsOwnerOrReadOnly
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
import os

User = get_user_model()

# Comment: Get the absolute path to the service account key, relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
service_account_path = os.path.join(BASE_DIR, 'venti-login-firebase-adminsdk-fbsvc-3d4d24d680.json')
# Comment: Use the dynamic path for the Firebase service account key
cred = credentials.Certificate(service_account_path)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing User instances."""
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the current user's profile."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_xp(self, request, pk=None):
        """Add XP to a user."""
        user = self.get_object()
        xp_amount = request.data.get('xp', 0)
        
        if not isinstance(xp_amount, (int, float)) or xp_amount <= 0:
            return Response(
                {'error': 'Invalid XP amount'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.add_xp(xp_amount)
        serializer = self.get_serializer(user)
        return Response(serializer.data)

class ProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing Profile instances."""
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        # Comment: Always allow the admin user by email, even if not authenticated
        admin_email = 'yasmineboualleg260@gmail.com'
        user = request.user

        # Comment: If not authenticated, check for Bearer token in Authorization header
        if not user or not user.is_authenticated:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                try:
                    # Comment: Verify the Firebase ID token
                    decoded_token = firebase_auth.verify_id_token(token)
                    firebase_uid = decoded_token.get('uid')
                    email = decoded_token.get('email')
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    # Comment: Try to get the user by Firebase UID or email
                    try:
                        user = User.objects.get(firebase_uid=firebase_uid)
                    except User.DoesNotExist:
                        try:
                            user = User.objects.get(email=email)
                        except User.DoesNotExist:
                            # Comment: Optionally, create a new user if not found
                            user = User.objects.create_user(
                                username=email.split('@')[0],
                                email=email,
                                firebase_uid=firebase_uid
                            )
                except Exception as e:
                    return Response({'error': 'Invalid or expired Firebase token', 'detail': str(e)}, status=401)
            else:
                return Response({'error': 'Authentication required'}, status=401)

        # Comment: If the user is the admin, always allow
        if user.email == admin_email:
            profile, _ = Profile.objects.get_or_create(user=user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)

        if not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        profile, _ = Profile.objects.get_or_create(user=user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def follow(self, request, pk=None):
        """Follow a user."""
        profile = self.get_object()
        if profile.user == request.user:
            return Response(
                {'error': 'You cannot follow yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        request.user.following.add(profile.user)
        return Response({'status': 'following'})

    @action(detail=True, methods=['post'])
    def unfollow(self, request, pk=None):
        """Unfollow a user."""
        profile = self.get_object()
        request.user.following.remove(profile.user)
        return Response({'status': 'unfollowed'})

    @action(detail=True, methods=['get'])
    def followers(self, request, pk=None):
        """Get a user's followers."""
        profile = self.get_object()
        followers = profile.user.followers.all()
        return Response({
            'followers': [
                {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'profile_picture': user.profile.avatar.url if user.profile.avatar else None
                }
                for user in followers
            ]
        })

    @action(detail=True, methods=['get'])
    def following(self, request, pk=None):
        """Get users that a user is following."""
        profile = self.get_object()
        following = profile.user.following.all()
        return Response({
            'following': [
                {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'profile_picture': user.profile.avatar.url if user.profile.avatar else None
                }
                for user in following
            ]
        }) 

    @action(detail=False, methods=['patch', 'put'], url_path='me')
    def update_me(self, request):
        # Comment: Allow PATCH/PUT to /profiles/me/ to update the current user's profile
        admin_email = 'yasmineboualleg260@gmail.com'
        user = request.user
        # Comment: If not authenticated, check for Bearer token in Authorization header
        if not user or not user.is_authenticated:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                try:
                    # Comment: Verify the Firebase ID token
                    decoded_token = firebase_auth.verify_id_token(token)
                    firebase_uid = decoded_token.get('uid')
                    email = decoded_token.get('email')
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    try:
                        user = User.objects.get(firebase_uid=firebase_uid)
                    except User.DoesNotExist:
                        try:
                            user = User.objects.get(email=email)
                        except User.DoesNotExist:
                            user = User.objects.create_user(
                                username=email.split('@')[0],
                                email=email,
                                firebase_uid=firebase_uid
                            )
                except Exception as e:
                    return Response({'error': 'Invalid or expired Firebase token', 'detail': str(e)}, status=401)
            else:
                return Response({'error': 'Authentication required'}, status=401)
        # Comment: If the user is the admin, always allow
        if user.email == admin_email or user.is_authenticated:
            profile, _ = Profile.objects.get_or_create(user=user)
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        return Response({'error': 'Authentication required'}, status=401) 