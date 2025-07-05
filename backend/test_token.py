#!/usr/bin/env python3
"""
Test Firebase token verification
"""

import requests
import json

def test_firebase_token():
    """Test Firebase token verification with the debug endpoint"""
    
    # Test with a sample token (this will fail, but we can see the error)
    test_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vdmVudGktbG9naW4iLCJhdWQiOiJ2ZW50aS1sb2dpbiIsImF1dGhfdGltZSI6MTczMDY5NzQzNCwidXNlcl9pZCI6InRlc3RfdXNlcl9pZCIsImlhdCI6MTczMDY5NzQzNCwiZXhwIjoxNzMwNzAxMDM0LCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbInRlc3RAZXhhbXBsZS5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJnb29nbGUuY29tIn19.test_signature"
    
    url = "http://192.168.100.77:8000/api/auth/debug-token/"
    
    print("🧪 Testing Firebase token verification...")
    print(f"URL: {url}")
    print(f"Token length: {len(test_token)}")
    print(f"Token preview: {test_token[:50]}...")
    
    try:
        response = requests.post(url, json={'firebase_token': test_token})
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - server might not be running")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_firebase_token()