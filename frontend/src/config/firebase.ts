import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAazjVFAnmLv6sd_eTar0_dZYCs-AOEuOM",
  authDomain: "venti-login.firebaseapp.com",
  projectId: "venti-login",
  storageBucket: "venti-login.appspot.com",
  messagingSenderId: "109869553891757971352",
  appId: "1:109869553891757971352:web:3d4d24d680d3f8475d5f6e",
  measurementId: "G-MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure auth settings for better compatibility
auth.useDeviceLanguage();
auth.settings.appVerificationDisabledForTesting = false;

// Log Firebase initialization
console.log('Firebase initialized with project:', firebaseConfig.projectId);

export default app; 