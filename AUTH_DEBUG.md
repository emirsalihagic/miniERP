# 🔍 Authentication Refresh Debug Guide

## Current Issue
Page refresh on protected routes (e.g., `/clients`) redirects to `/auth/login?returnUrl=%2Fclients` instead of staying on the page.

## Debugging Steps

### 1. Check Browser Console Logs
Open browser console (F12) and refresh the page. You should see these logs in order:

```
🚀 APP_INITIALIZER: Starting auth initialization...
🔐 Initializing auth state...
Token exists: true
Refresh token exists: true
Token expired: [true/false]
[If expired] Token expired, attempting refresh...
[If refresh succeeds] Token refresh successful
Auth state initialization complete
🚀 APP_INITIALIZER: Auth initialization complete
🛡️ AuthGuard checking: { isAuth: true, url: '/clients' }
```

### 2. Check Token Storage
Open browser DevTools → Application → Storage:
- **Local Storage**: Check for `access_token`, `refresh_token`, `user`
- **Session Storage**: Check for `access_token`, `refresh_token`, `user`, `auth_redirect_url`

### 3. Test Token Validity
Use the test page: Open `file:///Users/emirsalihagic/git/miniERP/test-auth.html` in browser

### 4. Manual Token Test
In browser console, run:
```javascript
// Check tokens
console.log('Access Token:', localStorage.getItem('access_token') || sessionStorage.getItem('access_token'));
console.log('Refresh Token:', localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token'));

// Check if token is expired
const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    console.log('Token expires at:', new Date(payload.exp * 1000));
    console.log('Current time:', new Date());
    console.log('Is expired:', payload.exp <= currentTime);
}
```

## Expected Behavior

### ✅ Working Scenario
1. User logs in → tokens stored
2. User navigates to `/clients`
3. User presses F5 (refresh)
4. APP_INITIALIZER runs → checks tokens → refreshes if needed
5. AuthGuard runs → finds valid token → allows access
6. User stays on `/clients`

### ❌ Current Issue
1. User logs in → tokens stored
2. User navigates to `/clients`
3. User presses F5 (refresh)
4. APP_INITIALIZER runs → but something fails
5. AuthGuard runs → finds no valid token → redirects to login
6. User redirected to `/auth/login?returnUrl=%2Fclients`

## Possible Causes

1. **APP_INITIALIZER not running**: No console logs starting with 🚀
2. **Token refresh failing**: Console shows "Token refresh failed"
3. **Storage not persisting**: Tokens missing from storage
4. **Timing issue**: Guard runs before initialization completes
5. **Token format issue**: Token exists but is malformed

## Quick Fix Test

If you see the issue, try this in browser console:
```javascript
// Force refresh token
fetch('http://localhost:3000/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        refreshToken: localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token')
    })
})
.then(r => r.json())
.then(data => {
    console.log('Refresh response:', data);
    if (data.accessToken) {
        localStorage.setItem('access_token', data.accessToken);
        console.log('Token updated, try refreshing page');
    }
});
```

## Next Steps
Based on console logs, we can identify the exact issue and fix it.
