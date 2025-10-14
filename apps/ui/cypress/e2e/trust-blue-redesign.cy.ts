describe('Trust Blue Redesign - Smoke Tests', () => {
  beforeEach(() => {
    // Clear any existing state
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Login Flow', () => {
    it('should successfully login and redirect to dashboard', () => {
      cy.visit('/auth/login');
      
      // Check login form is visible
      cy.get('form').should('be.visible');
      cy.get('input[formControlName="email"]').should('be.visible');
      cy.get('input[formControlName="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
      
      // Fill in credentials
      cy.get('input[formControlName="email"]').clear().type('admin@minierp.com');
      cy.get('input[formControlName="password"]').clear().type('password123');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
      cy.contains('Welcome to miniERP').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/auth/login');
      
      // Fill in invalid credentials
      cy.get('input[formControlName="email"]').clear().type('invalid@example.com');
      cy.get('input[formControlName="password"]').clear().type('wrongpassword');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should show error message
      cy.contains('Invalid credentials').should('be.visible');
      
      // Should remain on login page
      cy.url().should('include', '/auth/login');
    });
  });

  describe('Clients CRUD Happy Path', () => {
    beforeEach(() => {
      // Login first
      cy.visit('/auth/login');
      cy.get('input[formControlName="email"]').clear().type('admin@minierp.com');
      cy.get('input[formControlName="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should create a new client successfully', () => {
      // Navigate to clients page
      cy.visit('/clients');
      cy.contains('Clients').should('be.visible');
      
      // Click create client button
      cy.get('button').contains('Create Client').click();
      cy.url().should('include', '/clients/new');
      
      // Fill in client form
      cy.get('input[formControlName="name"]').type('Test Client Company');
      cy.get('input[formControlName="email"]').type('testclient@example.com');
      cy.get('input[formControlName="phone"]').type('+1234567890');
      cy.get('input[formControlName="website"]').type('https://testclient.com');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to clients list
      cy.url().should('include', '/clients');
      cy.contains('Test Client Company').should('be.visible');
    });

    it('should view client details', () => {
      // First create a client
      cy.visit('/clients/new');
      cy.get('input[formControlName="name"]').type('View Test Client');
      cy.get('input[formControlName="email"]').type('viewtest@example.com');
      cy.get('button[type="submit"]').click();
      
      // Navigate to clients list
      cy.visit('/clients');
      
      // Click on client name or view button
      cy.contains('View Test Client').click();
      
      // Should show client details
      cy.url().should('include', '/clients/');
      cy.contains('View Test Client').should('be.visible');
      cy.contains('viewtest@example.com').should('be.visible');
    });

    it('should edit client successfully', () => {
      // First create a client
      cy.visit('/clients/new');
      cy.get('input[formControlName="name"]').type('Edit Test Client');
      cy.get('input[formControlName="email"]').type('edittest@example.com');
      cy.get('button[type="submit"]').click();
      
      // Navigate to clients list
      cy.visit('/clients');
      
      // Click edit button
      cy.get('button').contains('Edit').first().click();
      
      // Should be on edit page
      cy.url().should('include', '/clients/');
      cy.url().should('include', '/edit');
      
      // Update client name
      cy.get('input[formControlName="name"]').clear().type('Updated Client Name');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to clients list
      cy.url().should('include', '/clients');
      cy.contains('Updated Client Name').should('be.visible');
    });

    it('should delete client successfully', () => {
      // First create a client
      cy.visit('/clients/new');
      cy.get('input[formControlName="name"]').type('Delete Test Client');
      cy.get('input[formControlName="email"]').type('deletetest@example.com');
      cy.get('button[type="submit"]').click();
      
      // Navigate to clients list
      cy.visit('/clients');
      
      // Click delete button
      cy.get('button').contains('Delete').first().click();
      
      // Should show confirmation modal
      cy.contains('Are you sure').should('be.visible');
      
      // Confirm deletion
      cy.get('button').contains('OK').click();
      
      // Client should be removed from list
      cy.contains('Delete Test Client').should('not.exist');
    });
  });

  describe('Menu Highlighting', () => {
    beforeEach(() => {
      // Login first
      cy.visit('/auth/login');
      cy.get('input[formControlName="email"]').clear().type('admin@minierp.com');
      cy.get('input[formControlName="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should highlight Dashboard menu when on dashboard', () => {
      cy.visit('/dashboard');
      
      // Check that Dashboard menu item has active class
      cy.get('li[routerlink="/dashboard"]').should('have.class', 'ant-menu-item-selected');
      
      // Check that other menu items are not active
      cy.get('li[routerlink="/clients"]').should('not.have.class', 'ant-menu-item-selected');
      cy.get('li[routerlink="/invoices"]').should('not.have.class', 'ant-menu-item-selected');
    });

    it('should highlight Clients menu when on clients page', () => {
      cy.visit('/clients');
      
      // Check that Clients submenu is open
      cy.get('li[nz-submenu]').contains('Clients').should('have.class', 'ant-menu-submenu-open');
      
      // Check that "All Clients" menu item has active class
      cy.get('li[routerlink="/clients"]').should('have.class', 'ant-menu-item-selected');
    });

    it('should highlight Create Client menu when on new client page', () => {
      cy.visit('/clients/new');
      
      // Check that Clients submenu is open
      cy.get('li[nz-submenu]').contains('Clients').should('have.class', 'ant-menu-submenu-open');
      
      // Check that "Create Client" menu item has active class
      cy.get('li[routerlink="/clients/new"]').should('have.class', 'ant-menu-item-selected');
    });

    it('should highlight Invoices menu when on invoices page', () => {
      cy.visit('/invoices');
      
      // Check that Invoices submenu is open
      cy.get('li[nz-submenu]').contains('Invoices').should('have.class', 'ant-menu-submenu-open');
      
      // Check that "All Invoices" menu item has active class
      cy.get('li[routerlink="/invoices"]').should('have.class', 'ant-menu-item-selected');
    });

    it('should highlight Create Invoice menu when on new invoice page', () => {
      cy.visit('/invoices/new');
      
      // Check that Invoices submenu is open
      cy.get('li[nz-submenu]').contains('Invoices').should('have.class', 'ant-menu-submenu-open');
      
      // Check that "Create Invoice" menu item has active class
      cy.get('li[routerlink="/invoices/new"]').should('have.class', 'ant-menu-item-selected');
    });
  });

  describe('Dark Mode Toggle', () => {
    beforeEach(() => {
      // Login first
      cy.visit('/auth/login');
      cy.get('input[formControlName="email"]').clear().type('admin@minierp.com');
      cy.get('input[formControlName="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should toggle dark mode successfully', () => {
      // Check initial theme (should be light by default)
      cy.get('html').should('not.have.class', 'dark');
      
      // Click theme toggle button
      cy.get('button.theme-toggle').click();
      
      // Check that dark class is applied
      cy.get('html').should('have.class', 'dark');
      
      // Click theme toggle again
      cy.get('button.theme-toggle').click();
      
      // Check that dark class is removed
      cy.get('html').should('not.have.class', 'dark');
    });

    it('should persist dark mode preference across page navigation', () => {
      // Toggle to dark mode
      cy.get('button.theme-toggle').click();
      cy.get('html').should('have.class', 'dark');
      
      // Navigate to different page
      cy.visit('/clients');
      
      // Check that dark mode is still active
      cy.get('html').should('have.class', 'dark');
      
      // Navigate back to dashboard
      cy.visit('/dashboard');
      
      // Check that dark mode is still active
      cy.get('html').should('have.class', 'dark');
    });

    it('should show correct icon for current theme', () => {
      // Initially should show moon icon (for light mode)
      cy.get('button.theme-toggle').within(() => {
        cy.get('span[nz-icon]').should('have.attr', 'nztype', 'moon');
      });
      
      // Toggle to dark mode
      cy.get('button.theme-toggle').click();
      
      // Should show sun icon (for dark mode)
      cy.get('button.theme-toggle').within(() => {
        cy.get('span[nz-icon]').should('have.attr', 'nztype', 'sun');
      });
    });

    it('should toggle dark mode from settings page', () => {
      // Navigate to settings page
      cy.visit('/settings');
      
      // Check that settings page is visible
      cy.contains('Settings').should('be.visible');
      cy.contains('Dark Mode').should('be.visible');
      
      // Toggle dark mode switch
      cy.get('nz-switch').click();
      
      // Check that dark class is applied
      cy.get('html').should('have.class', 'dark');
      
      // Toggle back
      cy.get('nz-switch').click();
      
      // Check that dark class is removed
      cy.get('html').should('not.have.class', 'dark');
    });
  });

  describe('Trust Blue Design Elements', () => {
    beforeEach(() => {
      // Login first
      cy.visit('/auth/login');
      cy.get('input[formControlName="email"]').clear().type('admin@minierp.com');
      cy.get('input[formControlName="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should display Trust Blue design elements on dashboard', () => {
      cy.visit('/dashboard');
      
      // Check for Trust Blue design elements
      cy.get('.dashboard-container').should('be.visible');
      cy.get('.welcome-section').should('be.visible');
      cy.get('.stats-grid').should('be.visible');
      cy.get('.stat-card').should('have.length.at.least', 1);
      cy.get('.content-grid').should('be.visible');
      cy.get('.content-card').should('have.length.at.least', 1);
    });

    it('should display Trust Blue design elements on clients page', () => {
      cy.visit('/clients');
      
      // Check for Trust Blue design elements
      cy.get('.clients-container').should('be.visible');
      cy.get('.page-header').should('be.visible');
      cy.get('.filters-card').should('be.visible');
      cy.get('.table-card').should('be.visible');
    });

    it('should display Trust Blue design elements on invoices page', () => {
      cy.visit('/invoices');
      
      // Check for Trust Blue design elements
      cy.get('.invoices-container').should('be.visible');
      cy.get('.page-header').should('be.visible');
      cy.get('.filters-card').should('be.visible');
      cy.get('.table-card').should('be.visible');
    });

    it('should have proper focus indicators for accessibility', () => {
      cy.visit('/clients');
      
      // Tab to first interactive element
      cy.get('body').type('{tab}');
      
      // Check that focus is visible
      cy.focused().should('be.visible');
      
      // Check that focused element has proper focus ring
      cy.focused().should('have.css', 'box-shadow').and('contain', 'rgba(37, 99, 235');
    });
  });
});
