from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import login
from django.contrib.auth import get_user_model
from users.authentication import FirebaseAuthenticationBackend
from utils.logger import logger
import logging

django_logger = logging.getLogger(__name__)
User = get_user_model()

# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def firebase_login(request):
    """
    Firebase authentication endpoint
    Accepts Firebase ID token and creates/authenticates user
    """
    firebase_token = request.data.get('firebase_token')
    
    if not firebase_token:
        logger.warning('AUTHENTICATION', 'Firebase login attempt without token', request=request)
        return Response(
            {'error': 'Firebase token is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Use Firebase authentication backend
        auth_backend = FirebaseAuthenticationBackend()
        user = auth_backend.authenticate(request, firebase_token=firebase_token)
        
        if user:
            # Log the user in, specifying the backend explicitly
            login(request, user, backend='users.authentication.FirebaseAuthenticationBackend')
            
            # Log successful login
            logger.user_login(
                str(user.id), 
                'firebase', 
                True, 
                request=request
            )
            
            # Return user data and success message
            return Response({
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'firebase_uid': user.firebase_uid,
                },
                'message': 'Authentication successful',
                'authenticated': True
            }, status=status.HTTP_200_OK)
        else:
            # Log failed login attempt
            logger.user_login(
                'unknown', 
                'firebase', 
                False, 
                'Invalid Firebase token',
                request=request
            )
            return Response(
                {'error': 'Invalid Firebase token'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
    except Exception as e:
        # Log authentication error
        logger.authentication_error(e, 'firebase_login', request)
        django_logger.error(f"Firebase authentication error: {e}")
        return Response(
            {'error': 'Authentication failed'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_current_user(request):
    """
    Get current authenticated user
    """
    if request.user.is_authenticated:
        logger.info('USER_INFO', 'Current user info requested', {
            'user_id': str(request.user.id),
            'email': request.user.email
        }, str(request.user.id), request)
        
        return Response({
            'user': {
                'id': request.user.id,
                'email': request.user.email,
                'username': request.user.username,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'firebase_uid': request.user.firebase_uid,
            },
            'authenticated': True
        })
    else:
        logger.warning('AUTHENTICATION', 'Unauthorized access attempt to get_current_user', request=request)
        return Response(
            {'authenticated': False}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['POST'])
def logout(request):
    """
    Logout current user
    """
    from django.contrib.auth import logout as django_logout
    
    if request.user.is_authenticated:
        user_id = str(request.user.id)
        logger.user_logout(user_id, request)
    
    django_logout(request)
    return Response({'message': 'Logged out successfully'})
