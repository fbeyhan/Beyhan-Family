import { LoginPage } from '../support/pages/LoginPage';
import { DashboardPage } from '../support/pages/DashboardPage';
import { FinancePage } from '../support/pages/FinancePage';


  describe.skip('Finance Dashboard', () => {
    const loginPage = new LoginPage();
    const dashboardPage = new DashboardPage();
    const financePage = new FinancePage();

    beforeEach(() => {
      // Login as admin and navigate to finance dashboard
      loginPage.visitLoginPage();
      loginPage.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
      loginPage.verifySuccessfulLogin();
      dashboardPage.navigateToPersonalFinance();
    });

    afterEach(() => {
      dashboardPage.clearStorage();
    });

    it('displays all main finance tiles', () => {
      financePage.verifyFinancePageElements();
      financePage.verifyNavigationCards();
    });

    it('navigates to Add Transaction page', () => {
      financePage.clickAddTransaction();
      cy.url().should('include', '/finance/add');
    });

    it('navigates to Transactions page', () => {
      financePage.clickTransactions();
      cy.url().should('include', '/finance/transactions');
    });

    it('navigates to Assets page', () => {
      financePage.clickAssets();
      cy.url().should('include', '/finance/assets');
    });

    it('navigates to Reports page', () => {
      financePage.clickReports();
      cy.url().should('include', '/finance/reports');
    });

    it('navigates back to main dashboard', () => {
      financePage.clickBackToDashboard();
      cy.url().should('include', '/dashboard');
      cy.url().should('not.include', '/finance');
    });
  });

// // describe.skip('Finance Dashboard', () => {
// //   const loginPage = new LoginPage();
// //   const dashboardPage = new DashboardPage();
// //   const financePage = new FinancePage();

// //   beforeEach(() => {
// //     // Clear any existing auth state
// //     cy.clearCookies();
// //     cy.clearLocalStorage();
// //   });

// //   context('Admin User Access', () => {
// //     beforeEach(() => {
// //       // Login as admin user
// //       loginPage.visitLoginPage();
// //       loginPage.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
// //       loginPage.verifySuccessfulLogin();
// //     });

// //     it('displays Personal Finance card on dashboard for admin', () => {
// //       cy.contains('Personal Finance').should('be.visible');
// //       cy.contains('Manage expenses, income, and financial tracking').should('be.visible');
// //     });

// //     it('allows admin to access finance dashboard', () => {
// //       cy.contains('Personal Finance').click();
// //       cy.get('a[data-discover="true"]').contains('Personal Finance').click();
// //       cy.wait(1000);
// //       cy.screenshot('finance-dashboard-debug');
// //       financePage.verifyFinancePageElements();
// //     });

// //     it('displays all overview stat cards', () => {
// //       cy.get('a[data-discover="true"]').contains('Personal Finance').click();
// //       financePage.visitFinancePage();
// //       //financePage.verifyOverviewStats();
// //     });

// //     it('displays all navigation cards', () => {
// //       cy.get('a[data-discover="true"]').contains('Personal Finance').click();
// //       financePage.visitFinancePage();
// //       financePage.verifyNavigationCards();
// //     });

// //     it('navigates to Add Transaction page', () => {
// //       cy.get('a[data-discover="true"]').contains('Personal Finance').click();
// //       financePage.visitFinancePage();
// //       financePage.clickAddTransaction();
// //       cy.url().should('include', '/finance/add');
// //     });

// //     it('navigates to Transactions page', () => {
// //       cy.get('a[data-discover="true"]').contains('Personal Finance').click();
// //       financePage.visitFinancePage();
// //       financePage.clickTransactions();
// //       cy.url().should('include', '/finance/transactions');
// //     });

// //     it('navigates to Assets page', () => {
// //       cy.get('a[data-discover="true"]').contains('Personal Finance').click();
// //       financePage.visitFinancePage();
// //       financePage.clickAssets();
// //       cy.url().should('include', '/finance/assets');
// //     });

// //     it('navigates to Reports page', () => {
// //       cy.get('a[data-discover="true"]').contains('Personal Finance').click();
// //       financePage.visitFinancePage();
// //       financePage.clickReports();
// //       cy.url().should('include', '/finance/reports');
// //     });

// //     it('navigates back to main dashboard', () => {
// //       cy.get('a[data-discover="true"]').contains('Personal Finance').click();
// //       financePage.visitFinancePage();
// //       financePage.clickBackToDashboard();
// //       cy.url().should('include', '/dashboard');
// //       cy.url().should('not.include', '/finance');
// //     });
// //   });

// //   context('Non-Admin User Access', () => {
// //     beforeEach(() => {
// //       // Login as regular user (non-admin)
// //       loginPage.visitLoginPage();
// //       loginPage.login(Cypress.env('TEST_EMAIL'), Cypress.env('TEST_PASSWORD'));
// //       loginPage.verifySuccessfulLogin();
// //     });

// //     it('does not display Personal Finance card for non-admin', () => {
// //       cy.contains('Personal Finance').should('not.exist');
// //     });

// //     it('redirects non-admin from finance pages to dashboard', () => {
// //       financePage.visitFinancePage();
// //       financePage.verifyRedirectedToDashboard();
// //     });
// //   });
// // });
