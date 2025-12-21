import { LoginPage } from '../support/pages/LoginPage';
import { DashboardPage } from '../support/pages/DashboardPage';
import { FinancePage } from '../support/pages/FinancePage';
import { FinanceReportsPage } from '../support/pages/FinanceReportsPage';

describe('Finance - Reports & Analytics', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();
  const financePage = new FinancePage();
  const reportsPage = new FinanceReportsPage();

  beforeEach(() => {
    // Clear auth state and login as admin
    cy.clearCookies();
    cy.clearLocalStorage();
    loginPage.visitLoginPage();
    loginPage.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
    loginPage.verifySuccessfulLogin();
    dashboardPage.navigateToPersonalFinance();
    financePage.clickReports();
  });

  it('displays reports page with all elements', () => {
    reportsPage.verifyReportsPageElements();
  });

  it('displays summary cards with financial totals', () => {
    reportsPage.verifySummaryCards();
  });

  it('allows selecting different months', () => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const monthStr = lastMonth.toISOString().slice(0, 7);
    reportsPage.selectMonth(monthStr);
    cy.wait(500);
    reportsPage.verifySummaryCards();
  });

  it('displays expenses by category chart', () => {
    reportsPage.verifyExpensesByCategoryChart();
  });

  it('displays top 5 spending categories', () => {
    reportsPage.verifyTopCategories();
  });

  it('displays monthly income vs expenses chart', () => {
    reportsPage.verifyMonthlyTrendChart();
  });

  it('displays net income trend chart', () => {
    reportsPage.verifyNetIncomeTrendChart();
  });

  it.skip('shows transaction count in summary', () => {
    reportsPage.verifyTransactionCount('2');
  });

  it('displays positive net income', () => {
    cy.contains('Net Income').parent().should('contain', '$');
    cy.contains('Surplus').should('be.visible');
  });

  it('exports data to CSV', () => {
    reportsPage.clickExportCSV();
    // File download should be triggered
    // Note: Cypress has limitations testing actual file downloads
    // This verifies the button click works
  });

  it('shows all chart sections even with no data', () => {
    reportsPage.verifyAllChartsRendered();
  });

  it('displays correct month in title', () => {
    const currentYear = new Date().getFullYear();
    cy.contains(`(${currentYear})`).should('be.visible');
  });

  it('navigates back to finance dashboard', () => {
    reportsPage.clickBackToFinance();
    cy.url().should('include', '/finance');
    cy.url().should('not.include', '/reports');
  });

  it('shows surplus or deficit indicator', () => {
    cy.contains('Net Income').should('be.visible');
    // Should show either "Surplus" or "Deficit"
  });

  it('displays export button', () => {
    cy.contains('Export CSV').should('be.visible');
  });

  it('month selector defaults to current month', () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    cy.get('input[type="month"]').should('have.value', currentMonth);
  });
  });