import { BasePage } from './BasePage';

/**
 * Finance Dashboard Page Object
 * Handles interactions with the main finance dashboard
 */
export class FinancePage extends BasePage {
  /**
   * Visit the finance dashboard
   */
  visitFinancePage(): void {
    this.visit('/finance');
  }

  /**
   * Verify finance page loads correctly
   */
  verifyFinancePageElements(): void {
    cy.contains('Personal Finance').should('be.visible');
    cy.url().then(url => {
      cy.log('Current URL:', url);
    });
    cy.document().then(doc => {
      cy.log('HTML:', doc.documentElement.outerHTML);
    });
    cy.get('[data-cy="finance-dashboard-subtitle"]', { timeout: 8000 }).should('be.visible');
    cy.contains('Monthly Expenses').should('be.visible');
    cy.contains('Monthly Income').should('be.visible');
    cy.contains('Net Income').should('be.visible');
    cy.contains('Net Worth').should('be.visible');
  }

  /**
   * Verify overview stats are displayed
   */
  verifyOverviewStats(): void {
    cy.contains('Monthly Expenses').parent().should('contain', '$');
    cy.contains('Monthly Income').parent().should('contain', '$');
    cy.contains('Net Worth').parent().should('contain', '$');
  }

  /**
   * Click on Add Transaction card
   */
  clickAddTransaction(): void {
    cy.contains('Add Transaction').click();
  }

  /**
   * Click on Transactions card
   */
  clickTransactions(): void {
    cy.contains('Transactions').parent().click();
  }

  /**
   * Click on Assets card
   */
  clickAssets(): void {
    cy.contains('Assets').parent().click();
  }

  /**
   * Click on Reports card
   */
  clickReports(): void {
    cy.contains('Reports').parent().click();
  }

  /**
   * Verify navigation cards are present
   */
  verifyNavigationCards(): void {
    cy.contains('Add Transaction').should('be.visible');
    cy.contains('Transactions').should('be.visible');
    cy.contains('Assets').should('be.visible');
    cy.contains('Reports').should('be.visible');
  }

  /**
   * Click back to dashboard
   */
  clickBackToDashboard(): void {
    cy.contains('Back to Dashboard').click();
  }

  /**
   * Verify redirected to dashboard (non-admin)
   */
  verifyRedirectedToDashboard(): void {
    cy.url().should('include', '/dashboard');
    cy.url().should('not.include', '/finance');
  }
}
