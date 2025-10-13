# Angular Routing Implementation

This document explains the routing implementation for the miniERP application, including deep-link support, navigation helpers, and unsaved changes protection.

## Overview

The routing system provides:
- **Deep-link resilience**: Refresh and direct URL access work correctly
- **Smart navigation**: Back navigation with fallback support
- **Unsaved changes protection**: Prevents data loss on form navigation
- **Scroll restoration**: Maintains scroll position on back/forward navigation
- **Fragment support**: Hash anchors work correctly

## Router Configuration

### Enhanced Router Setup
```typescript
// app.config.ts
provideRouter(
  routes,
  withInMemoryScrolling({
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled'
  })
)
```

**Features:**
- `scrollPositionRestoration: 'enabled'` - Restores scroll position on back/forward
- `anchorScrolling: 'enabled'` - Enables fragment (hash) scrolling

### Route Structure
```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { 
    path: 'auth', 
    canActivate: [NoAuthGuard],
    data: { hideSidebar: true },
    children: [...]
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component'),
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    canActivate: [AuthGuard],
    children: [
      { path: '', loadComponent: () => import('./features/users/users-list/users-list.component') },
      { 
        path: 'create', 
        loadComponent: () => import('./features/users/user-form/user-form.component'),
        canDeactivate: [PendingChangesGuard]
      },
      { 
        path: 'edit/:id', 
        loadComponent: () => import('./features/users/user-form/user-form.component'),
        canDeactivate: [PendingChangesGuard]
      }
    ]
  },
  { path: 'not-found', loadComponent: () => import('./features/not-found/not-found.component') },
  { path: '**', redirectTo: 'not-found' }
];
```

## Navigation Service

### Usage
```typescript
import { NavigationService } from './core/services/navigation.service';

constructor(private navigationService: NavigationService) {}

// Smart back navigation
this.navigationService.navigateBackOr('/dashboard');

// Navigate with query parameters
this.navigationService.navigateWithQueryParams('/users', { page: 2, limit: 20 });

// Navigate with fragment
this.navigationService.navigateWithFragment('/dashboard', 'section1');

// Update query params without navigation
this.navigationService.updateQueryParams({ page: 3 });
```

### Methods
- `navigateBackOr(fallback)` - Goes back if possible, otherwise navigates to fallback
- `navigateWithQueryParams(commands, queryParams)` - Navigate with query parameters
- `navigateWithFragment(commands, fragment)` - Navigate with hash fragment
- `updateQueryParams(queryParams)` - Update URL query params without navigation
- `canGoBack()` - Check if back navigation is possible

## Unsaved Changes Protection

### Implementation
```typescript
// Component implementing CanComponentDeactivate
export class UserFormComponent implements CanComponentDeactivate {
  form!: FormGroup;

  canDeactivate(): boolean {
    return !this.form.dirty; // Return false if form has unsaved changes
  }
}
```

### Guard Configuration
```typescript
// Route with unsaved changes protection
{
  path: 'create',
  loadComponent: () => import('./features/users/user-form/user-form.component'),
  canDeactivate: [PendingChangesGuard]
}
```

**Behavior:**
- Shows confirmation modal when leaving with unsaved changes
- Allows navigation if user confirms
- Prevents navigation if user cancels

## Server Configuration

### Nginx
```nginx
# nginx.conf
location / {
    try_files $uri $uri/ /index.html;
}
```

### Apache
```apache
# .htaccess
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Vercel
```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Cloudflare Pages
```
# _redirects
/*    /index.html   200
```

## Testing

### E2E Tests (Cypress)
```typescript
// cypress/e2e/routing.cy.ts
describe('Angular Routing', () => {
  it('should handle direct URL access', () => {
    cy.visit('/users');
    cy.url().should('include', '/users');
  });

  it('should prompt for unsaved changes', () => {
    cy.visit('/users/create');
    cy.get('input[formControlName="firstName"]').type('Test');
    cy.get('button').contains('Back to Users').click();
    cy.contains('Unsaved Changes').should('be.visible');
  });
});
```

### Unit Tests
```typescript
// navigation.service.spec.ts
describe('NavigationService', () => {
  it('should navigate back when possible', () => {
    spyOn(service, 'canGoBack').and.returnValue(true);
    service.navigateBackOr('/fallback');
    expect(mockLocation.back).toHaveBeenCalled();
  });
});
```

## Best Practices

### 1. Use NavigationService for Back Navigation
```typescript
// Good
this.navigationService.navigateBackOr('/dashboard');

// Avoid
this.router.navigate(['/dashboard']);
```

### 2. Implement CanComponentDeactivate for Forms
```typescript
// Always implement for forms with user input
export class MyFormComponent implements CanComponentDeactivate {
  canDeactivate(): boolean {
    return !this.form.dirty;
  }
}
```

### 3. Handle Query Parameters
```typescript
// Subscribe to query param changes
this.route.queryParamMap.subscribe(params => {
  const page = params.get('page') || '1';
  const limit = params.get('limit') || '10';
  this.loadData(page, limit);
});
```

### 4. Use Fragments for Section Navigation
```typescript
// Navigate to section
this.navigationService.navigateWithFragment('/dashboard', 'stats');

// In template
<div id="stats">Statistics Section</div>
```

## Troubleshooting

### Common Issues

1. **404 on Refresh**
   - Ensure server rewrite rules are configured
   - Check that `index.html` is served for all routes

2. **Scroll Position Not Restored**
   - Verify `scrollPositionRestoration: 'enabled'` is set
   - Check for CSS conflicts with `scroll-behavior`

3. **Unsaved Changes Not Detected**
   - Ensure component implements `CanComponentDeactivate`
   - Check that `canDeactivate()` returns `false` when form is dirty

4. **Navigation History Issues**
   - Use `NavigationService.navigateBackOr()` instead of direct router navigation
   - Check that routes are properly configured

### Debug Mode
```typescript
// Enable router tracing
provideRouter(routes, { enableTracing: true })
```

## Migration Guide

### From NgModule to Standalone
```typescript
// Old (NgModule)
RouterModule.forRoot(routes, {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled'
})

// New (Standalone)
provideRouter(
  routes,
  withInMemoryScrolling({
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled'
  })
)
```

### Adding Unsaved Changes Protection
1. Implement `CanComponentDeactivate` interface
2. Add `canDeactivate: [PendingChangesGuard]` to route
3. Return `false` when form has unsaved changes

### Updating Navigation
1. Replace direct router navigation with `NavigationService`
2. Use `navigateBackOr()` for back navigation
3. Use query param helpers for complex navigation
