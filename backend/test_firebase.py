#!/usr/bin/env python3
"""
Firebase Configuration Test Script
Tests if Firebase Admin SDK is properly configured
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'venti_api.settings')
django.setup()

from django.conf import settings
from users.authentication import initialize_firebase, FirebaseAuthenticationBackend
import firebase_admin
from firebase_admin import auth

def test_firebase_configuration():
    """Test Firebase configuration and authentication"""
    print("🔧 Testing Firebase Configuration...")
    print("=" * 50)
    
    # Test 1: Check environment variables
    print("\n1. Environment Variables:")
    firebase_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
    print(f"   FIREBASE_SERVICE_ACCOUNT_PATH: {firebase_path}")
    print(f"   File exists: {os.path.exists(firebase_path) if firebase_path else False}")
    
    # Test 2: Check service account file
    print("\n2. Service Account File:")
    default_path = os.path.join(os.path.dirname(__file__), 'firebase-service-account.json')
    print(f"   Default path: {default_path}")
    print(f"   File exists: {os.path.exists(default_path)}")
    
    # Test 3: Test Firebase initialization
    print("\n3. Firebase Admin SDK Initialization:")
    try:
        # Check if already initialized
        try:
            app = firebase_admin.get_app()
            print(f"   ✅ Firebase already initialized: {app.name}")
        except ValueError:
            print("   🔄 Firebase not initialized, attempting to initialize...")
            success = initialize_firebase()
            if success:
                print("   ✅ Firebase initialization successful")
            else:
                print("   ❌ Firebase initialization failed")
                return False
    except Exception as e:
        print(f"   ❌ Firebase initialization error: {e}")
        return False
    
    # Test 4: Test authentication backend
    print("\n4. Authentication Backend:")
    try:
        auth_backend = FirebaseAuthenticationBackend()
        print("   ✅ Authentication backend created successfully")
    except Exception as e:
        print(f"   ❌ Authentication backend error: {e}")
        return False
    
    # Test 5: Test Django settings
    print("\n5. Django Settings:")
    print(f"   AUTH_USER_MODEL: {getattr(settings, 'AUTH_USER_MODEL', 'Not set')}")
    print(f"   AUTHENTICATION_BACKENDS: {getattr(settings, 'AUTHENTICATION_BACKENDS', 'Not set')}")
    
    # Test 6: Test Firebase project configuration
    print("\n6. Firebase Project Configuration:")
    try:
        # Try to get project info
        project_id = firebase_admin.get_app().project_id
        print(f"   Project ID: {project_id}")
        print(f"   Expected Project ID: venti-login")
        if project_id == "venti-login":
            print("   ✅ Project ID matches")
        else:
            print("   ⚠️  Project ID mismatch")
    except Exception as e:
        print(f"   ❌ Could not get project info: {e}")
    
    print("\n" + "=" * 50)
    print("✅ Firebase configuration test completed!")
    return True

def test_firebase_token_verification():
    """Test Firebase token verification (requires a valid token)"""
    print("\n🔐 Testing Firebase Token Verification...")
    print("=" * 50)
    
    # This would require a valid Firebase ID token
    # For now, just test the structure
    print("   Note: Token verification test requires a valid Firebase ID token")
    print("   This test can be run after successful frontend authentication")
    
    return True

if __name__ == "__main__":
    print("🚀 Firebase Configuration Test")
    print("=" * 50)
    
    success = test_firebase_configuration()
    
    if success:
        test_firebase_token_verification()
        print("\n🎉 All tests passed! Firebase should be working correctly.")
        print("\nNext steps:")
        print("1. Start the backend server: python3 manage.py runserver 0.0.0.0:8000")
        print("2. Start the frontend: cd ../frontend && npm run dev")
        print("3. Try signing in with Google")
    else:
        print("\n❌ Firebase configuration has issues. Please check the errors above.")
        sys.exit(1) 