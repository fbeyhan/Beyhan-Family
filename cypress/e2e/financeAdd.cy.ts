import { LoginPage } from '../support/pages/LoginPage';
import { DashboardPage } from '../support/pages/DashboardPage';
import { FinanceAddPage } from '../support/pages/FinanceAddPage';
import { FinancePage } from '../support/pages/FinancePage';


describe.skip('Finance - Add Transaction', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();
  const financeAddPage = new FinanceAddPage();
  const financePage = new FinancePage();
  beforeEach(() => {
    // Clear auth state and login as admin
    cy.clearCookies();
    cy.clearLocalStorage();
    loginPage.visitLoginPage();
    loginPage.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
    loginPage.verifySuccessfulLogin();
    dashboardPage.navigateToPersonalFinance();
    //financePage.visitFinancePage();
    financePage.clickAddTransaction();
  });

  it('displays add transaction page with all elements', () => {
    financeAddPage.verifyAddTransactionPageElements();
  });

  it('allows switching between expense and income types', () => {
    financeAddPage.selectExpenseType();
      cy.contains('Expense').parent().invoke('attr', 'class').then(classes => {
        // Log the parent class list for debugging
        cy.log('Expense parent classes:', classes);
      });

    financeAddPage.selectIncomeType();
      cy.contains('Income').parent().invoke('attr', 'class').then(classes => {
        cy.log('Income parent classes:', classes);
      });
      // You can inspect the logs in the Cypress runner to find the correct selector
  });

  it.skip('adds an expense transaction successfully', () => {
    const today = new Date().toISOString().split('T')[0];
    
    financeAddPage.selectExpenseType();
    financeAddPage.enterAmount('125.50');
    financeAddPage.selectDate(today);
    financeAddPage.selectCategory('Food');
    financeAddPage.enterDescription('Grocery shopping');
    financeAddPage.submitTransaction();
    
    financeAddPage.verifySuccessMessage();
    financeAddPage.verifyFormCleared();
  });

  it.skip('adds an income transaction successfully', () => {
    const today = new Date().toISOString().split('T')[0];
    
    financeAddPage.selectIncomeType();
    financeAddPage.enterAmount('5000');
    financeAddPage.selectDate(today);
    financeAddPage.selectCategory('Salary');
    financeAddPage.enterDescription('Monthly paycheck');
    financeAddPage.submitTransaction();
    
    financeAddPage.verifySuccessMessage();
  });

  it.skip('adds expense with merchant and payment method', () => {
    const today = new Date().toISOString().split('T')[0];
    
    financeAddPage.selectExpenseType();
    financeAddPage.enterAmount('89.99');
    financeAddPage.selectDate(today);
    financeAddPage.selectCategory('Shopping');
    financeAddPage.enterMerchant('Amazon');
    financeAddPage.selectPaymentMethod('Credit Card');
    financeAddPage.enterDescription('Electronics purchase');
    financeAddPage.submitTransaction();
    
    financeAddPage.verifySuccessMessage();
  });

  it.skip('adds multiple transactions in quick succession', () => {
    const today = new Date().toISOString().split('T')[0];
    
    // First transaction
    financeAddPage.addExpense('25.00', 'Food', 'Coffee');
    financeAddPage.verifySuccessMessage();
    cy.wait(1000);
    
    // Second transaction
    financeAddPage.addExpense('50.00', 'Transportation', 'Gas');
    financeAddPage.verifySuccessMessage();
  });

  it.skip('requires amount and category fields', () => {
    financeAddPage.submitTransaction();
    // Form should not submit without required fields
    cy.url().should('include', '/finance/add');
  });

  it('navigates back to finance dashboard', () => {
    financeAddPage.clickBackToFinance();
    cy.url().should('include', '/finance');
    cy.url().should('not.include', '/add');
  });

  it.skip('defaults date to today', () => {
    const today = new Date().toISOString().split('T')[0];
    cy.get('input[type="date"]').should('have.value', today);
  });

  it('shows subcategory options for selected category', () => {
    financeAddPage.selectExpenseType();
    financeAddPage.selectCategory('Housing');
    cy.contains('Subcategory').should('be.visible');
  });
});
