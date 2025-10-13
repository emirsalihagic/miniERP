import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, filter, take, BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';

// WHY: On 401, we attempt ONE token refresh and retry the original request.
// This prevents logout on temporary token expiration and provides seamless UX.
// The isRefreshing flag prevents multiple simultaneous refresh attempts.
let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  if (token && !req.url.includes('/auth/')) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('/auth/refresh')) {
          if (!isRefreshing) {
            isRefreshing = true;
            refreshTokenSubject.next(null);
            
            return authService.refreshToken().pipe(
              switchMap((response) => {
                isRefreshing = false;
                refreshTokenSubject.next(response.accessToken);
                // Retry original request with new token
                return next(req.clone({
                  setHeaders: { Authorization: `Bearer ${response.accessToken}` }
                }));
              }),
              catchError((refreshError) => {
                isRefreshing = false;
                authService.logout();
                return throwError(() => refreshError);
              })
            );
          } else {
            // Wait for refresh to complete, then retry
            return refreshTokenSubject.pipe(
              filter(token => token !== null),
              take(1),
              switchMap(token => next(req.clone({
                setHeaders: { Authorization: `Bearer ${token}` }
              })))
            );
          }
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};

