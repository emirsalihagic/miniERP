describe('Angular Routing', () => {
  beforeEach(() => {
    // Visit the app
    cy.visit('/');
  });

  describe('Deep Link Support', () => {
    it('should handle direct URL access to dashboard', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');
      cy.contains('Welcome to miniERP').should('be.visible');
    });

    it('should handle direct URL access to users page', () => {
      cy.visit('/users');
      cy.url().should('include', '/users');
      cy.contains('Users Management').should('be.visible');
    });

    it('should handle direct URL access to user creation page', () => {
      cy.visit('/users/create');
      cy.url().should('include', '/users/create');
      cy.contains('Create User').should('be.visible');
    });

    it('should handle direct URL access to user edit page', () => {
      // First create a user, then edit it
      cy.visit('/users/create');
      cy.get('input[formControlName="firstName"]').type('Test User');
      cy.get('input[formControlName="lastName"]').type('Test Last');
      cy.get('input[formControlName="email"]').type('test@example.com');
      cy.get('input[formControlName="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Wait for redirect to users list
      cy.url().should('include', '/users');
      
      // Click edit button
      cy.get('button').contains('Edit').first().click();
      cy.url().should('include', '/users/edit/');
      cy.contains('Edit User').should('be.visible');
    });

    it('should handle 404 page for invalid routes', () => {
      cy.visit('/invalid-route');
      cy.url().should('include', '/not-found');
      cy.contains('404').should('be.visible');
      cy.contains('Sorry, the page you visited does not exist').should('be.visible');
    });
  });

  describe('Navigation Behavior', () => {
    beforeEach(() => {
      // Login first
      cy.visit('/auth/login');
      cy.get('input[formControlName="email"]').clear().type('admin@minierp.com');
      cy.get('input[formControlName="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should navigate back correctly from user form', () => {
      cy.visit('/users');
      cy.get('button').contains('Create User').click();
      cy.url().should('include', '/users/create');
      
      cy.get('button').contains('Back to Users').click();
      cy.url().should('include', '/users');
    });

    it('should handle browser back button', () => {
      cy.visit('/users');
      cy.get('button').contains('Create User').click();
      cy.url().should('include', '/users/create');
      
      cy.go('back');
      cy.url().should('include', '/users');
    });

    it('should handle browser forward button', () => {
      cy.visit('/users');
      cy.get('button').contains('Create User').click();
      cy.url().should('include', '/users/create');
      
      cy.go('back');
      cy.url().should('include', '/users');
      
      cy.go('forward');
      cy.url().should('include', '/users/create');
    });
  });

  describe('Unsaved Changes Protection', () => {
    beforeEach(() => {
      // Login first
      cy.visit('/auth/login');
      cy.get('input[formControlName="email"]').clear().type('admin@minierp.com');
      cy.get('input[formControlName="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should prompt for unsaved changes when leaving form', () => {
      cy.visit('/users/create');
      
      // Make changes to form
      cy.get('input[formControlName="firstName"]').type('Test');
      
      // Try to navigate away
      cy.get('button').contains('Back to Users').click();
      
      // Should show confirmation modal
      cy.contains('Unsaved Changes').should('be.visible');
      cy.contains('You have unsaved changes').should('be.visible');
      
      // Click "Stay" to remain on form
      cy.get('button').contains('Stay').click();
      cy.url().should('include', '/users/create');
    });

    it('should allow navigation when confirming unsaved changes', () => {
      cy.visit('/users/create');
      
      // Make changes to form
      cy.get('input[formControlName="firstName"]').type('Test');
      
      // Try to navigate away
      cy.get('button').contains('Back to Users').click();
      
      // Should show confirmation modal
      cy.contains('Unsaved Changes').should('be.visible');
      
      // Click "Leave" to navigate away
      cy.get('button').contains('Leave').click();
      cy.url().should('include', '/users');
    });

    it('should not prompt when form is clean', () => {
      cy.visit('/users/create');
      
      // Don't make any changes
      cy.get('button').contains('Back to Users').click();
      
      // Should navigate directly without modal
      cy.url().should('include', '/users');
    });
  });

  describe('Query Parameters and Fragments', () => {
    beforeEach(() => {
      // Login first
      cy.visit('/auth/login');
      cy.get('input[formControlName="email"]').clear().type('admin@minierp.com');
      cy.get('input[formControlName="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should preserve query parameters', () => {
      cy.visit('/users?page=2&limit=20');
      cy.url().should('include', 'page=2');
      cy.url().should('include', 'limit=20');
    });

    it('should handle fragments in URL', () => {
      cy.visit('/dashboard#section1');
      cy.url().should('include', '#section1');
    });
  });

  describe('Page Refresh', () => {
    beforeEach(() => {
      // Login first
      cy.visit('/auth/login');
      cy.get('input[formControlName="email"]').clear().type('admin@minierp.com');
      cy.get('input[formControlName="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should maintain state after page refresh', () => {
      cy.visit('/users');
      cy.contains('Users Management').should('be.visible');
      
      // Refresh page
      cy.reload();
      
      // Should still be on users page
      cy.url().should('include', '/users');
      cy.contains('Users Management').should('be.visible');
    });

    it('should redirect to login after refresh if not authenticated', () => {
      // Clear localStorage to simulate no auth
      cy.clearLocalStorage();
      
      // Try to access protected route
      cy.visit('/users');
      
      // Should redirect to login
      cy.url().should('include', '/auth/login');
    });
  });
});
