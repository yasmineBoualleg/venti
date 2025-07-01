# 🚀 Quick Start Guide - Firebase Authentication

## ✅ What's Already Set Up

1. **Firebase Service Account** - ✅ Created
2. **Django Firebase Authentication** - ✅ Implemented
3. **Frontend Firebase Integration** - ✅ Updated
4. **Network Access** - ✅ Configured
5. **Environment Variables** - ✅ Set
6. **Proper API Endpoints** - ✅ Fixed
7. **Firebase Admin SDK** - ✅ Configured
8. **Welcome Page** - ✅ Created

## 🔥 Firebase Console Setup Required

### 1. Add Authorized Domains
Go to [Firebase Console](https://console.firebase.google.com/project/venti-login) → Authentication → Settings → Authorized domains

Add these domains:
- `localhost`
- `127.0.0.1`
- `0.0.0.0`
- `192.168.100.77` (your network IP)

### 2. Enable Google Sign-In
Go to Firebase Console → Authentication → Sign-in method → Google → Enable

## 🚀 Start the Application

### Option 1: Automated Script (Recommended)
```bash
chmod +x start-network.sh
./start-network.sh
```

### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
./start-backend.sh

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Option 3: Manual with Environment Variables
```bash
# Terminal 1 - Backend
cd backend
export FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
export SECRET_KEY="fuckmeandfuckthisshitbecauseicouldntbeanormalperson"
python3 manage.py runserver 0.0.0.0:8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🌐 Access URLs

- **Frontend**: `http://192.168.100.77:3000`
- **Backend API**: `http://192.168.100.77:8000`

## 🔧 API Endpoints

### Authentication Endpoints
- `POST /api/auth/firebase-login/` - Firebase authentication
- `GET /api/auth/user/` - Get current user
- `POST /api/auth/logout/` - Logout user

### User Endpoints
- `GET /api/users/users/me/` - Get current user details
- `PUT /api/users/users/me/` - Update user profile

## 🧪 Test Authentication

1. Open `http://192.168.100.77:3000`
2. Click "Continue with Google"
3. Sign in with your Google account
4. You'll be redirected to the **Welcome Page** showing your user details
5. Check Django admin to see if user was created

## 🎯 User Flow

### For New Users:
1. **Landing Page** (`/`) → Click "Get Started"
2. **Login Page** (`/login`) → Click "Continue with Google"
3. **Google OAuth** → Sign in with Google account
4. **Welcome Page** (`/welcome`) → See user details and authentication status

### For Returning Users:
1. **Landing Page** (`/`) → Automatically redirected to Welcome Page if already authenticated
2. **Welcome Page** (`/welcome`) → See user details and authentication status

## 🔧 Troubleshooting

### If you get "Firebase: Error (auth/unauthorized-domain)"
- Make sure you added `192.168.100.77` to Firebase authorized domains
- Try adding `0.0.0.0` as well

### If you get "Invalid Firebase token" or "Your default credentials were not found"
- Check that the service account file exists: `backend/firebase-service-account.json`
- Verify environment variable: `echo $FIREBASE_SERVICE_ACCOUNT_PATH`
- Use the provided start scripts that set environment variables automatically

### If user is not created in Django
- Check Django logs for authentication errors
- Verify Firebase project ID matches: `venti-login`
- Run the test script: `cd backend && python3 test_firebase.py`

### If API endpoints return 404
- Make sure the backend server is running
- Check that the URL patterns are correct: `/api/auth/firebase-login/`

### If Django server won't start
- Kill any existing Django processes: `pkill -f "manage.py runserver"`
- Use the provided start scripts that handle environment variables

### If Welcome page doesn't show user data
- Check browser console for errors
- Verify that user data is stored in localStorage
- Try refreshing the page

## 📁 Files Created/Updated

### Backend
- ✅ `backend/firebase-service-account.json` - Firebase credentials
- ✅ `backend/custom_auth/` - New authentication app
- ✅ `backend/custom_auth/views.py` - Firebase login endpoint
- ✅ `backend/custom_auth/urls.py` - Auth URL patterns
- ✅ `backend/users/authentication.py` - Firebase auth backend (improved)
- ✅ `backend/venti_api/settings.py` - Updated with custom_auth app and logging
- ✅ `backend/venti_api/urls.py` - Updated URL structure
- ✅ `backend/users/models.py` - Added firebase_uid field
- ✅ `backend/users/views.py` - Cleaned up (removed old firebase_auth)
- ✅ `backend/test_firebase.py` - Firebase configuration test script

### Frontend
- ✅ `frontend/src/config/firebase.ts` - Updated with your Firebase config
- ✅ `frontend/src/api/auth.ts` - Updated to use correct endpoints
- ✅ `frontend/src/api/api.ts` - Updated API interceptor
- ✅ `frontend/src/pages/Welcome.tsx` - New welcome page component
- ✅ `frontend/src/pages/Login.tsx` - Updated to redirect to welcome page
- ✅ `frontend/src/pages/Landing.tsx` - Added authentication check
- ✅ `frontend/src/App.tsx` - Added welcome route

### Scripts
- ✅ `start-network.sh` - Automated startup script (improved)
- ✅ `start-backend.sh` - Backend-only startup script

## 🎉 Ready to Test!

Everything is configured and ready. Just run:
```bash
./start-network.sh
```

Then share `http://192.168.100.77:3000` with your teammates!

## 🔄 Authentication Flow

1. **User clicks "Continue with Google"**
2. **Firebase handles Google OAuth**
3. **Frontend gets Firebase ID token**
4. **Frontend sends token to `/api/auth/firebase-login/`**
5. **Django verifies token with Firebase Admin SDK**
6. **Django creates/updates user in database**
7. **Django returns user data and session**
8. **Frontend stores user data and token**
9. **User is redirected to Welcome page**

## 🧪 Testing Firebase Configuration

To test if Firebase is properly configured:
```bash
cd backend
python3 test_firebase.py
```

This will verify:
- Service account file exists
- Firebase Admin SDK can initialize
- Authentication backend is working

## 🎯 Welcome Page Features

The Welcome page includes:
- ✅ User profile display with avatar
- ✅ User details (ID, email, username, Firebase UID)
- ✅ Authentication status
- ✅ Sign out functionality
- ✅ Refresh page option
- ✅ Responsive design
- ✅ Loading states 
