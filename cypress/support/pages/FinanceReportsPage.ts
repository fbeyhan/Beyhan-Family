import { BasePage } from './BasePage';

/**
 * Finance Reports Page Object
 * Handles interactions with the reports and analytics page
 */
export class FinanceReportsPage extends BasePage {
  /**
   * Visit the reports page
   */
  visitReportsPage(): void {
    this.visit('/finance/reports');
  }

  /**
   * Verify reports page elements
   */
  verifyReportsPageElements(): void {
    cy.contains('Reports & Analytics').should('be.visible');
    cy.contains('Financial insights and trends').should('be.visible');
    cy.contains('Total Expenses').should('be.visible');
    cy.contains('Total Income').should('be.visible');
    cy.contains('Net Income').should('be.visible');
  }

  /**
   * Select month
   */
  selectMonth(month: string): void {
    cy.get('input[type="month"]').clear().type(month);
  }

  /**
   * Click export CSV button
   */
  clickExportCSV(): void {
    cy.contains('Export CSV').click();
  }

  /**
   * Verify summary cards
   */
  verifySummaryCards(): void {
    cy.contains('Total Expenses').parent().should('contain', '$');
    cy.contains('Total Income').parent().should('contain', '$');
    cy.contains('Net Income').parent().should('contain', '$');
  }

  /**
   * Verify expenses by category chart exists
   */
  verifyExpensesByCategoryChart(): void {
    cy.contains('Expenses by Category').should('be.visible');
  }

  /**
   * Verify top categories section exists
   */
  verifyTopCategories(): void {
    cy.contains('Top 5 Spending Categories').should('be.visible');
  }

  /**
   * Verify monthly trend chart exists
   */
  verifyMonthlyTrendChart(): void {
    cy.contains('Monthly Income vs Expenses').should('be.visible');
  }

  /**
   * Verify net income trend chart exists
   */
  verifyNetIncomeTrendChart(): void {
    cy.contains('Net Income Trend').should('be.visible');
  }

  /**
   * Verify all charts are rendered
   */
  verifyAllChartsRendered(): void {
    this.verifyExpensesByCategoryChart();
    this.verifyTopCategories();
    this.verifyMonthlyTrendChart();
    this.verifyNetIncomeTrendChart();
  }

  /**
   * Verify transaction count in summary
   */
  verifyTransactionCount(expectedCount: string): void {
    cy.contains('transactions').should('contain', expectedCount);
  }

  /**
   * Click back to finance
   */
  clickBackToFinance(): void {
    cy.contains('Back to Finance').click();
  }
}
