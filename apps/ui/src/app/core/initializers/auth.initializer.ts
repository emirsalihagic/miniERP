import { AuthService } from '../services/auth.service';

/**
 * WHY: APP_INITIALIZER ensures auth state is hydrated BEFORE routing/guards run.
 * This prevents the race condition where guards check isAuthenticated() before
 * tokens are loaded from storage, causing false redirects to login on page refresh.
 */
export function initializeAuth(authService: AuthService): () => Promise<void> {
  return () => {
    return authService.initializeAuthState().then(() => {
      // Auth initialization complete
    }).catch((error) => {
      console.error('Auth initialization failed:', error);
    });
  };
}
