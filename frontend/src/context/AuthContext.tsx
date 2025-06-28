import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

interface AuthContextType {
  user: (User & { id: string; djangoId?: number }) | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<(User & { id: string; djangoId?: number }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get Django user ID
          const response = await axios.get('/api/auth/user/');
          setUser({ ...user, id: user.uid, djangoId: response.data.id });
        } catch (error) {
          console.error('Error fetching Django user:', error);
          setUser({ ...user, id: user.uid });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Provide dynamic imports for signInWithGoogle and signOut
  const dynamicSignInWithGoogle = async () => {
    const { signInWithGoogle } = await import('../api/auth');
    return signInWithGoogle();
  };
  const dynamicSignOut = async () => {
    const { signOut } = await import('../api/auth');
    return signOut();
  };

  const value = {
    user,
    loading,
    signInWithGoogle: dynamicSignInWithGoogle,
    signOut: dynamicSignOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 