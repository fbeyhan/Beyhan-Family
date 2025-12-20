import { LoginPage } from '../support/pages/LoginPage';
import { FinanceAddPage } from '../support/pages/FinanceAddPage';

describe.skip('Finance - Add Transaction', () => {
  const loginPage = new LoginPage();
  const financeAddPage = new FinanceAddPage();

  beforeEach(() => {
    // Clear auth state and login as admin
    cy.clearCookies();
    cy.clearLocalStorage();
    loginPage.visitLoginPage();
    loginPage.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
    // Wait for dashboard to load after login
    cy.contains('Personal Finance', { timeout: 10000 }).should('be.visible');
    // Now navigate to /finance
    cy.visit('/finance');
    cy.wait(1000);
    cy.screenshot('finance-page-debug');
    financeAddPage.visitFinanceAddPage();
    // Debug: log current URL and page content
    cy.url().then(url => cy.log('Current URL:', url));
    cy.document().then(doc => cy.log('Page content:', doc.documentElement.outerHTML));
  });

  it('displays add transaction page with all elements', () => {
    financeAddPage.verifyAddTransactionPageElements();
  });

  it('allows switching between expense and income types', () => {
    financeAddPage.selectType('expense');
    cy.contains('Expense').parent().should('have.class', 'from-red-500');
    
    financeAddPage.selectType('income');
    cy.contains('Income').parent().should('have.class', 'from-green-500');
  });

  it('adds an expense transaction successfully', () => {
    const today = new Date().toISOString().split('T')[0];
    
    financeAddPage.selectType('expense');
    financeAddPage.enterAmount('125.50');
    financeAddPage.selectDate(today);
    financeAddPage.selectCategory('Food');
    financeAddPage.enterDescription('Grocery shopping');
    financeAddPage.submitTransaction();
    
    financeAddPage.verifySuccessMessage();
    financeAddPage.verifyFormCleared();
  });

  it('adds an income transaction successfully', () => {
    const today = new Date().toISOString().split('T')[0];
    
    financeAddPage.selectType('income');
    financeAddPage.enterAmount('5000');
    financeAddPage.selectDate(today);
    financeAddPage.selectCategory('Salary');
    financeAddPage.enterDescription('Monthly paycheck');
    financeAddPage.submitTransaction();
    
    financeAddPage.verifySuccessMessage();
  });

  it('adds expense with merchant and payment method', () => {
    const today = new Date().toISOString().split('T')[0];
    
    financeAddPage.selectType('expense');
    financeAddPage.enterAmount('89.99');
    financeAddPage.selectDate(today);
    financeAddPage.selectCategory('Shopping');
    financeAddPage.enterMerchant('Amazon');
    financeAddPage.selectPaymentMethod('Credit Card');
    financeAddPage.enterDescription('Electronics purchase');
    financeAddPage.submitTransaction();
    
    financeAddPage.verifySuccessMessage();
  });

  it('adds multiple transactions in quick succession', () => {
    const today = new Date().toISOString().split('T')[0];
    
    // First transaction
    financeAddPage.addExpense('25.00', 'Food', 'Coffee');
    financeAddPage.verifySuccessMessage();
    cy.wait(1000);
    
    // Second transaction
    financeAddPage.addExpense('50.00', 'Transportation', 'Gas');
    financeAddPage.verifySuccessMessage();
  });

  it('requires amount and category fields', () => {
    financeAddPage.submitTransaction();
    // Form should not submit without required fields
    cy.url().should('include', '/finance/add');
  });

  it('navigates back to finance dashboard', () => {
    financeAddPage.clickBackToFinance();
    cy.url().should('include', '/finance');
    cy.url().should('not.include', '/add');
  });

  it('defaults date to today', () => {
    const today = new Date().toISOString().split('T')[0];
    cy.get('input[type="date"]').should('have.value', today);
  });

  it('shows subcategory options for selected category', () => {
    financeAddPage.selectType('expense');
    financeAddPage.selectCategory('Housing');
    cy.contains('Subcategory').should('be.visible');
  });
});
