import { auth } from '../config/firebase';
import { User } from 'firebase/auth';

interface TokenInfo {
  token: string;
  expirationTime: number;
  issuedAt: number;
}

class TokenManager {
  private refreshPromise: Promise<string> | null = null;
  private tokenRefreshInterval: NodeJS.Timeout | null = null;

  /**
   * Get a valid Firebase token, refreshing if necessary
   */
  async getValidToken(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return localStorage.getItem('firebase_token');
      }

      // Check if we have a stored token and if it's still valid
      const storedToken = localStorage.getItem('firebase_token');
      if (storedToken) {
        const tokenInfo = this.parseToken(storedToken);
        if (tokenInfo && this.isTokenValid(tokenInfo)) {
          return storedToken;
        }
      }

      // Token is expired or invalid, refresh it
      return await this.refreshToken(user);
    } catch (error) {
      console.error('❌ Error getting valid token:', error);
      return null;
    }
  }

  /**
   * Refresh the Firebase token
   */
  async refreshToken(user: User): Promise<string> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh(user);
    
    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(user: User): Promise<string> {
    try {
      console.log('🔄 Refreshing Firebase token...');
      const token = await user.getIdToken(true);
      localStorage.setItem('firebase_token', token);
      console.log('✅ Token refreshed successfully');
      return token;
    } catch (error) {
      console.error('❌ Failed to refresh token:', error);
      // Clear invalid token
      localStorage.removeItem('firebase_token');
      throw error;
    }
  }

  /**
   * Parse JWT token to get expiration info
   */
  private parseToken(token: string): TokenInfo | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        token,
        expirationTime: payload.exp * 1000, // Convert to milliseconds
        issuedAt: payload.iat * 1000
      };
    } catch (error) {
      console.error('❌ Error parsing token:', error);
      return null;
    }
  }

  /**
   * Check if token is still valid (with 5 minute buffer)
   */
  private isTokenValid(tokenInfo: TokenInfo): boolean {
    const now = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes
    return tokenInfo.expirationTime > (now + bufferTime);
  }

  /**
   * Start automatic token refresh
   */
  startAutoRefresh(): void {
    if (this.tokenRefreshInterval) {
      return; // Already started
    }

    // Refresh token every 50 minutes (tokens expire in 1 hour)
    this.tokenRefreshInterval = setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          await this.refreshToken(user);
        } catch (error) {
          console.error('❌ Auto-refresh failed:', error);
          // Stop auto-refresh on error
          this.stopAutoRefresh();
        }
      }
    }, 50 * 60 * 1000); // 50 minutes
  }

  /**
   * Stop automatic token refresh
   */
  stopAutoRefresh(): void {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
    }
  }

  /**
   * Clear all stored tokens
   */
  clearTokens(): void {
    localStorage.removeItem('firebase_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.stopAutoRefresh();
  }

  /**
   * Get token expiration time
   */
  getTokenExpirationTime(): number | null {
    const token = localStorage.getItem('firebase_token');
    if (!token) return null;

    const tokenInfo = this.parseToken(token);
    return tokenInfo?.expirationTime || null;
  }

  /**
   * Check if token will expire soon (within 10 minutes)
   */
  isTokenExpiringSoon(): boolean {
    const expirationTime = this.getTokenExpirationTime();
    if (!expirationTime) return true;

    const now = Date.now();
    const warningTime = 10 * 60 * 1000; // 10 minutes
    return expirationTime < (now + warningTime);
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();
export default tokenManager; 