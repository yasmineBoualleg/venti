import firebase_admin
from firebase_admin import credentials, auth
from firebase_admin.auth import InvalidIdTokenError
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import os
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK with proper error handling"""
    try:
        # Check if Firebase app is already initialized
        firebase_admin.get_app()
        logger.info("Firebase Admin SDK already initialized")
        return True
    except ValueError:
        # App not initialized, proceed with initialization
        pass
    
    try:
        # Try to get the service account key from environment variable
        service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
        
        if service_account_path and os.path.exists(service_account_path):
            logger.info(f"Using service account from: {service_account_path}")
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized with service account")
            return True
        else:
            # Try to use the default path in the backend directory
            default_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'firebase-service-account.json')
            if os.path.exists(default_path):
                logger.info(f"Using default service account from: {default_path}")
                cred = credentials.Certificate(default_path)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin SDK initialized with default service account")
                return True
            else:
                logger.error(f"Service account file not found at: {service_account_path or default_path}")
                return False
                
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
        return False

# Initialize Firebase on module import
firebase_initialized = initialize_firebase()

class FirebaseAuthentication(BaseAuthentication):
    """
    DRF authentication class for Firebase
    """
    
    def authenticate(self, request):
        # Get the Firebase token from the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None
        
        firebase_token = auth_header.split(' ')[1]
        
        if not firebase_initialized:
            raise AuthenticationFailed('Firebase not initialized')
            
        try:
            # Verify the Firebase token
            decoded_token = auth.verify_id_token(firebase_token)
            firebase_uid = decoded_token['uid']
            email = decoded_token.get('email', '')
            name = decoded_token.get('name', '')
            
            logger.info(f"Firebase token verified for user: {email} (UID: {firebase_uid})")
            
            # Try to get existing user by Firebase UID
            try:
                user = User.objects.get(firebase_uid=firebase_uid)
                # Update user info if needed
                if email and user.email != email:
                    user.email = email
                if name and user.first_name != name:
                    user.first_name = name
                user.save()
                logger.info(f"Existing user found and updated: {user.email}")
                return (user, None)
            except User.DoesNotExist:
                # Create new user
                username = email.split('@')[0] if email else f"user_{firebase_uid[:8]}"
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=name,
                    firebase_uid=firebase_uid
                )
                logger.info(f"New user created: {user.email}")
                return (user, None)
                
        except InvalidIdTokenError as e:
            if 'expired' in str(e).lower():
                logger.error(f"Firebase authentication error: Token expired: {e}")
                raise AuthenticationFailed('Expired Firebase token')
            logger.error(f"Firebase authentication error: {e}")
            raise AuthenticationFailed('Invalid Firebase token')
        except Exception as e:
            logger.error(f"Firebase authentication error: {e}")
            raise AuthenticationFailed('Invalid Firebase token')

class FirebaseAuthenticationBackend(BaseBackend):
    """
    Custom authentication backend for Firebase
    """
    
    def authenticate(self, request, firebase_token=None):
        if not firebase_token:
            print("❌ No Firebase token provided")
            return None
        
        if not firebase_initialized:
            print("❌ Firebase Admin SDK not initialized")
            logger.error("Firebase Admin SDK not initialized")
            return None
            
        try:
            print(f"🔥 Verifying Firebase token...")
            # Verify the Firebase token
            decoded_token = auth.verify_id_token(firebase_token)
            firebase_uid = decoded_token['uid']
            email = decoded_token.get('email', '')
            name = decoded_token.get('name', '')
            
            print(f"✅ Firebase token verified for user: {email} (UID: {firebase_uid})")
            logger.info(f"Firebase token verified for user: {email} (UID: {firebase_uid})")
            
            # Try to get existing user by Firebase UID
            try:
                user = User.objects.get(firebase_uid=firebase_uid)
                print(f"✅ Existing user found: {user.email}")
                # Update user info if needed
                if email and user.email != email:
                    user.email = email
                if name and user.first_name != name:
                    user.first_name = name
                user.save()
                logger.info(f"Existing user found and updated: {user.email}")
                return user
            except User.DoesNotExist:
                print(f"🆕 Creating new user for: {email}")
                # Create new user
                username = email.split('@')[0] if email else f"user_{firebase_uid[:8]}"
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=name,
                    firebase_uid=firebase_uid
                )
                print(f"✅ New user created: {user.email}")
                logger.info(f"New user created: {user.email}")
                return user
                
        except InvalidIdTokenError as e:
            print(f"❌ Invalid Firebase token: {e}")
            if 'expired' in str(e).lower():
                logger.error(f"Firebase authentication error: Token expired: {e}")
                return None
            logger.error(f"Firebase authentication error: {e}")
            return None
        except Exception as e:
            print(f"❌ Firebase authentication error: {e}")
            print(f"❌ Exception type: {type(e).__name__}")
            import traceback
            print(f"❌ Traceback: {traceback.format_exc()}")
            logger.error(f"Firebase authentication error: {e}")
            return None
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None 