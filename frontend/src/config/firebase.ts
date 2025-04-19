import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAazjVFAnmLv6sd_eTar0_dZYCs-AOEuOM",
  authDomain: "venti-login.firebaseapp.com",
  projectId: "venti-login",
  storageBucket: "venti-login.firebasestorage.app",
  messagingSenderId: "184192612892",
  appId: "1:184192612892:web:29705b8b212f19a4f5bdd9",
  measurementId: "G-YESX7L8NQP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth }; 