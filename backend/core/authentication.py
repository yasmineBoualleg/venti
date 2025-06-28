import firebase_admin
from firebase_admin import auth, credentials
from rest_framework import authentication
from rest_framework import exceptions
from django.conf import settings
import os
from rest_framework.authentication import BaseAuthentication
from django.contrib.auth import get_user_model

# Set the path to the service account key file
SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'venti-login-firebase-adminsdk-fbsvc-3d4d24d680.json')

# Initialize Firebase Admin SDK using the service account file
cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)

try:
    # Try to initialize the Firebase app
    firebase_admin.initialize_app(cred)
except ValueError:
    # App already initialized
    pass

# Comment: Define a custom authentication class for Firebase
class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # Comment: Get the Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        # Comment: Extract the token
        token = auth_header.split(' ')[1]
        try:
            # Comment: Verify the Firebase ID token
            decoded_token = auth.verify_id_token(token)
            firebase_uid = decoded_token.get('uid')
            email = decoded_token.get('email')
            User = get_user_model()
            # Comment: Try to get the user by Firebase UID or email
            try:
                user = User.objects.get(firebase_uid=firebase_uid)
            except User.DoesNotExist:
                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    # Comment: Create a new user if not found
                    user = User.objects.create_user(
                        username=email.split('@')[0],
                        email=email,
                        firebase_uid=firebase_uid
                    )
            # Comment: Return the user and None for the auth token
            return (user, None)
        except Exception as e:
            # Comment: Raise an authentication failed exception if token is invalid
            raise exceptions.AuthenticationFailed('Invalid Firebase token: ' + str(e)) 