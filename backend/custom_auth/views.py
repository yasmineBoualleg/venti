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
    
    print(f"🔥 Firebase login attempt - Token length: {len(firebase_token) if firebase_token else 0}")
    print(f"🔥 Request data: {request.data}")
    
    if not firebase_token:
        logger.warning('AUTHENTICATION', 'Firebase login attempt without token', request=request)
        return Response(
            {'error': 'Firebase token is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        print(f"🔥 Attempting to authenticate with Firebase token...")
        # Use Firebase authentication backend
        auth_backend = FirebaseAuthenticationBackend()
        user = auth_backend.authenticate(request, firebase_token=firebase_token)
        
        if user:
            print(f"✅ Authentication successful for user: {user.email}")
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
            print(f"❌ Authentication failed - user is None")
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
        print(f"❌ Firebase authentication exception: {e}")
        print(f"❌ Exception type: {type(e).__name__}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        
        # Log authentication error
        logger.authentication_error(e, 'firebase_login', request)
        django_logger.error(f"Firebase authentication error: {e}")
        return Response(
            {'error': f'Authentication failed: {str(e)}'}, 
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

@api_view(['POST'])
@permission_classes([AllowAny])
def debug_firebase_token(request):
    """
    Debug endpoint to test Firebase token verification
    """
    firebase_token = request.data.get('firebase_token')
    
    print(f"🔍 Debug: Testing Firebase token...")
    print(f"🔍 Token length: {len(firebase_token) if firebase_token else 0}")
    print(f"🔍 Token preview: {firebase_token[:50] + '...' if firebase_token else 'None'}")
    
    if not firebase_token:
        return Response(
            {'error': 'Firebase token is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        from firebase_admin import auth
        from firebase_admin.auth import InvalidIdTokenError
        
        print(f"🔍 Attempting to verify token...")
        decoded_token = auth.verify_id_token(firebase_token)
        
        print(f"✅ Token verification successful!")
        print(f"🔍 Decoded token keys: {list(decoded_token.keys())}")
        print(f"🔍 UID: {decoded_token.get('uid', 'Not found')}")
        print(f"🔍 Email: {decoded_token.get('email', 'Not found')}")
        print(f"🔍 Issuer: {decoded_token.get('iss', 'Not found')}")
        print(f"🔍 Audience: {decoded_token.get('aud', 'Not found')}")
        
        return Response({
            'success': True,
            'token_info': {
                'uid': decoded_token.get('uid'),
                'email': decoded_token.get('email'),
                'issuer': decoded_token.get('iss'),
                'audience': decoded_token.get('aud'),
                'exp': decoded_token.get('exp'),
                'iat': decoded_token.get('iat')
            }
        })
        
    except InvalidIdTokenError as e:
        print(f"❌ Invalid token error: {e}")
        return Response(
            {'error': f'Invalid Firebase token: {str(e)}'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        return Response(
            {'error': f'Token verification failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
