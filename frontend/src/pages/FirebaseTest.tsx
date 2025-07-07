import React, { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { getApp } from 'firebase/app';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';

const FirebaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing...');
  const [error, setError] = useState<string>('');
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    const testFirebase = async () => {
      try {
        setStatus('Testing Firebase configuration...');
        
        const results: any = {};
        
        // Test 1: Firebase Auth Object
        if (!auth) {
          throw new Error('Firebase auth is not initialized');
        }
        results.authObject = '✅ Available';
        
        // Test 2: Firebase App
        try {
          const app = getApp();
          results.appObject = '✅ Available';
          console.log('Firebase app:', app);
        } catch (err) {
          results.appObject = '❌ Not Available';
        }
        
        // Test 3: Google Provider
        try {
          const provider = new GoogleAuthProvider();
          results.googleProvider = '✅ Available';
        } catch (err) {
          results.googleProvider = '❌ Not Available';
        }
        
        // Test 4: Current User
        results.currentUser = auth.currentUser ? '✅ Logged In' : '❌ Not Logged In';
        
        // Test 4.1: User Details (if logged in)
        if (auth.currentUser) {
          results.userEmail = `Email: ${auth.currentUser.email}`;
          results.userUid = `UID: ${auth.currentUser.uid}`;
          results.userDisplayName = `Name: ${auth.currentUser.displayName || 'Not set'}`;
        }
        
        // Test 5: Check authorized domains
        const currentDomain = window.location.hostname;
        results.currentDomain = `Current: ${currentDomain}`;
        
        // Test 6: Check for redirect parameters
        const urlParams = new URLSearchParams(window.location.search);
        const hasRedirectParams = urlParams.has('apiKey') || urlParams.has('authType');
        results.redirectParams = hasRedirectParams ? '✅ Found' : '❌ Not Found';
        
        setTestResults(results);
        setStatus('Firebase configuration test completed!');
        
      } catch (err: any) {
        setError(err.message);
        setStatus('Firebase test failed');
        console.error('Firebase test error:', err);
      }
    };

    testFirebase();
  }, []);

  const handleTestSignIn = async () => {
    try {
      setStatus('Testing Google Sign-In (popup)...');
      const provider = new GoogleAuthProvider();
      
      // Try popup first, fallback to redirect
      try {
        const result = await signInWithPopup(auth, provider);
        setStatus(`✅ Sign-in successful! User: ${result.user.email}`);
        setTestResults((prev: any) => ({ ...prev, currentUser: '✅ Logged In' }));
      } catch (popupError: any) {
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
          setStatus('Popup blocked, trying redirect...');
          await signInWithRedirect(auth, provider);
          // The page will redirect
        } else {
          throw popupError;
        }
      }
    } catch (err: any) {
      setError(`Sign-in failed: ${err.message}`);
      setStatus('❌ Sign-in test failed');
      console.error('Sign-in error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      setStatus('Signing out...');
      await signOut(auth);
      setStatus('✅ Signed out successfully');
      setTestResults((prev: any) => ({ ...prev, currentUser: '❌ Not Logged In' }));
    } catch (err: any) {
      setError(`Sign-out failed: ${err.message}`);
      setStatus('❌ Sign-out failed');
      console.error('Sign-out error:', err);
    }
  };

  const handleTestBackendAuth = async () => {
    try {
      setStatus('Testing backend authentication...');
      
      // Get current Firebase token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('No user logged in');
        setStatus('❌ No user logged in');
        return;
      }
      
      const firebaseToken = await currentUser.getIdToken(true); // Force refresh
      console.log('Firebase token obtained:', firebaseToken.substring(0, 50) + '...');
      
      // Test backend authentication
      const response = await fetch('http://192.168.100.77:8000/api/auth/firebase-login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebase_token: firebaseToken
        })
      });
      
      const data = await response.json();
      console.log('Backend response:', data);
      
      if (response.ok) {
        setStatus('✅ Backend authentication successful!');
        setError('');
      } else {
        setError(`Backend authentication failed: ${data.error || 'Unknown error'}`);
        setStatus('❌ Backend authentication failed');
      }
      
    } catch (err: any) {
      setError(`Backend test failed: ${err.message}`);
      setStatus('❌ Backend test failed');
      console.error('Backend test error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-4">Firebase Configuration Test</h1>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Status:</p>
          <p className={`font-semibold ${status.includes('failed') || status.includes('❌') ? 'text-red-600' : 'text-green-600'}`}>
            {status}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Configuration Details:</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Firebase Auth Object: {testResults.authObject || '⏳ Testing...'}</p>
            <p>• Firebase App Object: {testResults.appObject || '⏳ Testing...'}</p>
            <p>• Google Provider: {testResults.googleProvider || '⏳ Testing...'}</p>
            <p>• Current User: {testResults.currentUser || '⏳ Testing...'}</p>
            {testResults.userEmail && <p>• {testResults.userEmail}</p>}
            {testResults.userUid && <p>• {testResults.userUid}</p>}
            {testResults.userDisplayName && <p>• {testResults.userDisplayName}</p>}
            <p>• Current Domain: {testResults.currentDomain || '⏳ Testing...'}</p>
            <p>• Redirect Parameters: {testResults.redirectParams || '⏳ Testing...'}</p>
            <p>• Auth Domain: venti-login.firebaseapp.com</p>
            <p>• Project ID: venti-login</p>
            <p>• API Key: ✅ Set</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Firebase Console Setup Required:</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>1. Go to <a href="https://console.firebase.google.com/project/venti-login" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Console</a></p>
            <p>2. Navigate to Authentication → Sign-in method</p>
            <p>3. Enable Google Sign-in</p>
            <p>4. Add authorized domains: localhost, 127.0.0.1</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleTestSignIn}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Test Google Sign-In (Popup)
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
          
          <button
            onClick={handleTestBackendAuth}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
          >
            Test Backend Authentication
          </button>
          
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            Go to Login Page
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            Go to Landing Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest; 