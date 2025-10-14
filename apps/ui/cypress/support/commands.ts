// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to select DOM element by data-cy attribute
Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-cy=${value}]`);
});

// Custom command to login with default admin credentials
Cypress.Commands.add('login', () => {
  cy.visit('/auth/login');
  cy.get('input[formControlName="email"]').clear().type('admin@minierp.com');
  cy.get('input[formControlName="password"]').clear().type('password123');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Custom command to toggle dark mode
Cypress.Commands.add('toggleDarkMode', () => {
  cy.get('button.theme-toggle').click();
});
