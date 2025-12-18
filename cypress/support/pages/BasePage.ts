/**
 * Base Page Object
 * Contains common methods and utilities shared across all pages
 */
export class BasePage {
  /**
   * Visit a specific URL
   */
  visit(path: string = '/'): void {
    cy.visit(path);
  }

  /**
   * Get element by selector
   */
  getElement(selector: string): Cypress.Chainable {
    return cy.get(selector);
  }

  /**
   * Get element by text content
   */
  getByText(text: string, options?: Partial<Cypress.Loggable & Cypress.Timeoutable>): Cypress.Chainable {
    return cy.contains(text, options);
  }

  /**
   * Click element by text
   */
  clickByText(text: string): void {
    cy.contains(text).click();
  }

  /**
   * Clear browser storage
   */
  clearStorage(): void {
    cy.clearCookies();
    cy.clearLocalStorage();
  }

  /**
   * Wait for specific duration
   */
  wait(duration: number): void {
    cy.wait(duration);
  }

  /**
   * Reload the page
   */
  reload(): void {
    cy.reload();
  }

  /**
   * Verify URL contains specific path
   */
  verifyUrlContains(path: string): void {
    cy.url().should('include', path);
  }

  /**
   * Verify element exists
   */
  verifyElementExists(text: string, options?: Partial<Cypress.Loggable & Cypress.Timeoutable>): void {
    cy.contains(text, options).should('exist');
  }

  /**
   * Verify element does not exist
   */
  verifyElementNotExists(text: string): void {
    cy.contains(text).should('not.exist');
  }

  /**
   * Auto-confirm browser dialogs
   */
  autoConfirmDialog(): void {
    cy.on('window:confirm', () => true);
  }
}
