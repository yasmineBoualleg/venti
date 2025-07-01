# Firebase Authentication Troubleshooting Guide

## Error: `auth/internal-error`

This error typically indicates a configuration issue with Firebase Authentication. Here's how to fix it:

### 1. Check Firebase Console Configuration

**Step 1: Enable Google Sign-in**
1. Go to [Firebase Console](https://console.firebase.google.com/project/venti-login)
2. Navigate to **Authentication** → **Sign-in method**
3. Click on **Google** provider
4. Enable it and save

**Step 2: Add Authorized Domains**
1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add these domains:
   - `localhost`
   - `127.0.0.1`
   - `192.168.100.77` (your local IP)
   - `venti-login.firebaseapp.com`

### 2. Check Google Cloud Console

**Step 1: Enable Google+ API**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/library)
2. Search for "Google+ API" or "Google Identity"
3. Enable it if not already enabled

**Step 2: Configure OAuth Consent Screen**
1. Go to **APIs & Services** → **OAuth consent screen**
2. Add your domain to authorized domains
3. Add test users if in testing mode

### 3. Verify Firebase Configuration

Check that your `firebase.ts` file has the correct configuration:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyAazjVFAnmLv6sd_eTar0_dZYCs-AOEuOM",
  authDomain: "venti-login.firebaseapp.com",
  projectId: "venti-login",
  storageBucket: "venti-login.appspot.com",
  messagingSenderId: "109869553891757971352",
  appId: "1:109869553891757971352:web:3d4d24d680d3f8475d5f6e"
};
```

### 4. Test Steps

1. **Clear browser cache and cookies**
2. **Test with Firebase Test Page**: Go to `/test` to verify configuration
3. **Check browser console** for detailed error messages
4. **Try in incognito/private mode** to rule out browser extensions

### 5. Common Solutions

**Solution 1: Wait and Retry**
- Sometimes Firebase needs a few minutes to propagate configuration changes
- Wait 5-10 minutes after making changes in Firebase Console

**Solution 2: Check Network**
- Ensure you can access `https://accounts.google.com`
- Check if any firewall/proxy is blocking Google services

**Solution 3: Verify Domain**
- Make sure you're accessing the app from an authorized domain
- Check that the domain in your browser matches the authorized domains

### 6. Debug Information

When you get the error, check the browser console for:
- Current URL
- Redirect parameters
- Firebase configuration details
- Network requests to Google/Firebase

### 7. Alternative Testing

If redirect continues to fail, you can temporarily test with popup:

```typescript
// In auth.ts, temporarily change to:
import { signInWithPopup } from 'firebase/auth';

// And use:
const result = await signInWithPopup(auth, provider);
```

### 8. Contact Support

If the issue persists:
1. Check Firebase status page: https://status.firebase.google.com/
2. Verify your Firebase project is active and not suspended
3. Check billing status if using paid features

## Quick Fix Checklist

- [ ] Google Sign-in enabled in Firebase Console
- [ ] Authorized domains added (localhost, 127.0.0.1, your IP)
- [ ] Google+ API enabled in Google Cloud Console
- [ ] OAuth consent screen configured
- [ ] Browser cache cleared
- [ ] Tested in incognito mode
- [ ] Waited 5-10 minutes after configuration changes 