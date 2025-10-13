import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { NavigationService } from './navigation.service';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    clientId?: string;
    supplierId?: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  clientId?: string;
  supplierId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private redirectUrl: string | null = null;
  private isInitialized = false;

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private navigationService: NavigationService
  ) {
    this.loadUserFromStorage();
  }

  /**
   * WHY: APP_INITIALIZER ensures auth state is hydrated BEFORE routing/guards run.
   * This prevents the race condition where guards check isAuthenticated() before
   * tokens are loaded from storage, causing false redirects to login on page refresh.
   */
  async initializeAuthState(): Promise<void> {
    const token = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!token) {
      this.isInitialized = true;
      return;
    }

    const isExpired = this.isTokenExpired(token);

    // If token expired but we have refresh token, try refreshing
    if (isExpired && refreshToken) {
      try {
        const response = await firstValueFrom(this.refreshToken());
        // Note: setAccessToken is already called inside refreshToken() method
      } catch (error) {
        this.clearSession();
      }
    }

    this.isInitialized = true;
  }

  login(email: string, password: string, remember: boolean = false): Observable<LoginResponse> {
    return new Observable(observer => {
      this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password }).subscribe({
        next: (response: LoginResponse) => {
          this.setSession(response, remember);
          observer.next(response);
          observer.complete();
        },
        error: (error: any) => observer.error(error)
      });
    });
  }

  register(name: string, email: string, password: string): Observable<LoginResponse> {
    return new Observable(observer => {
      this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, { name, email, password }).subscribe({
        next: (response: LoginResponse) => {
          this.setSession(response, true);
          observer.next(response);
          observer.complete();
        },
        error: (error: any) => observer.error(error)
      });
    });
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/reset-password`, { token, password });
  }

  refreshToken(): Observable<{ accessToken: string }> {
    const refreshToken = this.getRefreshToken();
    return new Observable(observer => {
      this.http.post<{ accessToken: string }>(`${this.apiUrl}/auth/refresh`, { refreshToken }).subscribe({
        next: (response: { accessToken: string }) => {
          this.setAccessToken(response.accessToken);
          observer.next(response);
          observer.complete();
        },
        error: (error: any) => observer.error(error)
      });
    });
  }


  private setSession(authResult: LoginResponse, remember: boolean): void {
    console.log('🔐 [AuthService] Setting session for user:', authResult.user);
    console.log('🔐 [AuthService] Using storage:', remember ? 'localStorage' : 'sessionStorage');
    
    const storage = remember ? localStorage : sessionStorage;
    
    storage.setItem('access_token', authResult.accessToken);
    storage.setItem('refresh_token', authResult.refreshToken);
    storage.setItem('user', JSON.stringify(authResult.user));
    
    console.log('✅ [AuthService] Session set, updating current user subject');
    this.currentUserSubject.next(authResult.user);
  }

  private clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    
    this.currentUserSubject.next(null);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('❌ [AuthService] Error parsing user from storage:', e);
        this.clearSession();
      }
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
  }

  private setAccessToken(token: string): void {
    const storage = localStorage.getItem('access_token') ? localStorage : sessionStorage;
    storage.setItem('access_token', token);
  }

  /**
   * Check if a JWT token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp <= currentTime;
    } catch (e) {
      return true; // If token is malformed, consider it expired
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }

    const isExpired = this.isTokenExpired(token);

    // Since APP_INITIALIZER handles token refresh, we just check if token exists
    // and is not expired (basic check)
    return !isExpired;
  }


  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  logout(): void {
    this.clearSession();
    this.navigationService.navigateToLogin();
  }

  /**
   * WHY: redirectUrl persisted to sessionStorage survives page refresh.
   * Memory-only storage was lost on F5, breaking returnUrl functionality.
   */
  setRedirectUrl(url: string): void {
    sessionStorage.setItem('auth_redirect_url', url);
  }

  getRedirectUrl(): string | null {
    return sessionStorage.getItem('auth_redirect_url');
  }

  clearRedirectUrl(): void {
    sessionStorage.removeItem('auth_redirect_url');
  }

  redirectAfterLogin(): void {
    const redirectUrl = this.getRedirectUrl();
    if (redirectUrl) {
      this.clearRedirectUrl();
      this.router.navigate([redirectUrl]);
    } else {
      this.navigationService.navigateToDashboard();
    }
  }
}

