# 🔥 Firebase Setup Guide for Venti 2.0

## Current Issue
You're getting "Project ID: Not set" and Google Sign-in is not working. This is likely due to Firebase Console configuration.

## 🔧 Firebase Console Setup Required

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/project/venti-login)
2. Make sure you're in the correct project: **venti-login**

### Step 2: Enable Google Authentication
1. In the left sidebar, click **Authentication**
2. Click **Sign-in method** tab
3. Find **Google** in the list of providers
4. Click **Edit** (pencil icon)
5. **Enable** Google Sign-in
6. Add your **Project support email** (your email)
7. Click **Save**

### Step 3: Add Authorized Domains
1. In Authentication, click **Settings** tab
2. Scroll down to **Authorized domains**
3. Add these domains:
   - `localhost`
   - `127.0.0.1`
   - `0.0.0.0`
   - `192.168.100.77` (your network IP)

### Step 4: Verify Project Configuration
1. Go to **Project Settings** (gear icon)
2. Verify these settings:
   - **Project ID**: `venti-login`
   - **Project name**: `venti-login`
   - **Web API Key**: `AIzaSyAazjVFAnmLv6sd_eTar0_dZYCs-AOEuOM`

## 🧪 Testing Steps

### 1. Test Firebase Configuration
1. Go to `http://localhost:3000/test`
2. Check if all tests pass
3. Try the "Test Google Sign-In" button

### 2. Test from Login Page
1. Go to `http://localhost:3000/login`
2. Click "Continue with Google"
3. Check browser console for errors

### 3. Check Browser Console
Open Developer Tools (F12) and look for:
- Firebase initialization errors
- Authentication errors
- Network errors

## 🚨 Common Issues & Solutions

### Issue 1: "auth/unauthorized-domain"
**Solution**: Add the domain to Firebase Console → Authentication → Settings → Authorized domains

### Issue 2: "auth/popup-blocked"
**Solution**: Allow popups for localhost in your browser

### Issue 3: "auth/internal-error"
**Solution**: Check if Google Sign-in is enabled in Firebase Console

### Issue 4: "Project ID: Not set"
**Solution**: This is just a display issue in the test page. The actual Firebase config is correct.

## 🔍 Debug Information

### Current Configuration
- **Project ID**: `venti-login`
- **Auth Domain**: `venti-login.firebaseapp.com`
- **API Key**: `AIzaSyAazjVFAnmLv6sd_eTar0_dZYCs-AOEuOM`
- **Frontend URL**: `http://localhost:3000`
- **Backend URL**: `http://localhost:8000`

### Expected Flow
1. User clicks "Continue with Google"
2. Google OAuth popup opens
3. User signs in with Google
4. Firebase returns user data
5. Frontend sends Firebase token to backend
6. Backend verifies token and creates/authenticates user
7. User is redirected to Welcome page

## 📞 Next Steps

1. **Follow the Firebase Console setup steps above**
2. **Test the configuration at `/test`**
3. **Try signing in from the login page**
4. **Check browser console for any errors**
5. **Let me know what specific error you get**

## 🔗 Useful Links
- [Firebase Console](https://console.firebase.google.com/project/venti-login)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Google Sign-in Setup](https://firebase.google.com/docs/auth/web/google-signin) 