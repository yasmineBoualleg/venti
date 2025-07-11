import { onAuthStateChanged, onIdTokenChanged, User } from 'firebase/auth';
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';
import { signInWithGoogle, signOut } from '../api/auth';
import { auth } from '../config/firebase';
import tokenManager from '../utils/tokenManager';

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signInWithGoogle: () => Promise<User>;
	signOut: () => Promise<void>;
	isAuthenticated: boolean;
	tokenExpired: boolean;
	refreshToken: () => Promise<void>;
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
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [tokenExpired, setTokenExpired] = useState(false);

	// Function to handle authentication errors and redirect to login
	const handleAuthError = (error?: any) => {
		console.log('🔄 Authentication error detected, redirecting to login...');

		// Clear all auth data using token manager
		tokenManager.clearTokens();

		// Reset state
		setUser(null);
		setTokenExpired(true);

		// Redirect to login page
		if (
			window.location.pathname !== '/login' &&
			window.location.pathname !== '/'
		) {
			window.location.href = '/login';
		}
	};

	// Function to refresh token
	const refreshToken = async () => {
		try {
			const currentUser = auth.currentUser;
			if (currentUser) {
				await tokenManager.refreshToken(currentUser);
				setTokenExpired(false);
				console.log('✅ Token refreshed successfully');
			}
		} catch (error) {
			console.error('❌ Failed to refresh token:', error);
			handleAuthError(error);
		}
	};

	useEffect(() => {
		// Check for existing user data in localStorage first
		const storedUser = localStorage.getItem('user');
		const firebaseToken = tokenManager.getStoredTokenPublic();

		if (storedUser && firebaseToken) {
			try {
				const userData = JSON.parse(storedUser);
				console.log('Found existing user data:', userData);

				// Create a mock user object that matches Firebase User interface
				const mockUser = {
					uid: userData.firebase_uid || 'mock_uid',
					email: userData.email,
					displayName: `${userData.first_name} ${userData.last_name}`,
					photoURL: null,
					emailVerified: true,
					isAnonymous: false,
					metadata: {},
					providerData: [],
					refreshToken: '',
					tenantId: null,
					delete: () => Promise.resolve(),
					getIdToken: () => Promise.resolve(firebaseToken),
					getIdTokenResult: () => Promise.resolve({} as any),
					reload: () => Promise.resolve(),
					toJSON: () => ({}),
					phoneNumber: null,
					providerId: 'password',
				} as User;

				setUser(mockUser);
				setLoading(false);

				// Start auto-refresh for mock users
				tokenManager.startAutoRefresh();
				return;
			} catch (error) {
				console.error('Error parsing stored user data:', error);
				// Clear invalid data
				tokenManager.clearTokens();
			}
		}

		// Set up Firebase auth state listener
		const authStateUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			console.log('🔥 Firebase auth state changed:', firebaseUser?.email);
			setUser(firebaseUser);
			setLoading(false);

			if (firebaseUser) {
				// Start automatic token refresh
				tokenManager.startAutoRefresh();
			} else {
				// User is not authenticated, clear any stored data
				tokenManager.clearTokens();
				setTokenExpired(false);
			}
		});

		// Set up Firebase token listener for token synchronization
		const tokenUnsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				try {
					// Just get the current token without forcing refresh
					const token = await firebaseUser.getIdToken(false); // false = don't force refresh
					tokenManager.storeTokenPublic(token);
					setTokenExpired(false);
					console.log('✅ Firebase token synchronized');
				} catch (error) {
					console.error('❌ Token sync failed:', error);
					handleAuthError(error);
				}
			} else {
				// No user, clear token
				tokenManager.clearTokens();
				setTokenExpired(false);
			}
		});

		// Set up network error detection
		const handleNetworkError = () => {
			console.log('🌐 Network connection restored, checking auth status...');
			const currentUser = auth.currentUser;
			if (currentUser) {
				refreshToken().catch(handleAuthError);
			}
		};

		// Listen for online/offline events
		window.addEventListener('online', handleNetworkError);

		// Cleanup function
		return () => {
			authStateUnsubscribe();
			tokenUnsubscribe();
			tokenManager.stopAutoRefresh();
			window.removeEventListener('online', handleNetworkError);
		};
	}, []);

	const value = {
		user,
		loading,
		signInWithGoogle,
		signOut,
		isAuthenticated: !!user,
		tokenExpired,
		refreshToken,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
};
