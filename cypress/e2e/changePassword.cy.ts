import { LoginPage } from '../support/pages/LoginPage';
import { ChangePasswordPage } from '../support/pages/ChangePasswordPage';

describe('Change Password', () => {
  const loginPage = new LoginPage();
  const changePasswordPage = new ChangePasswordPage();

  beforeEach(() => {
    // Login and navigate to Change Password page
    loginPage.visitLoginPage();
    loginPage.login(Cypress.env('TEST_EMAIL'), Cypress.env('TEST_PASSWORD'));
    loginPage.verifySuccessfulLogin();
    changePasswordPage.navigateToChangePassword();
  });

  afterEach(() => {
    changePasswordPage.clearStorage();
  });

  it('displays all form elements', () => {
    changePasswordPage.verifyFormElements();
  });

  it('shows error for empty fields', () => {
    changePasswordPage.clickUpdatePassword();
    changePasswordPage.verifyErrorMessage('All fields are required');
  });

  it('shows error for short password', () => {
    changePasswordPage.fillPasswordFields('wrongpassword', '12345', '12345');
    changePasswordPage.clickUpdatePassword();
    changePasswordPage.verifyErrorMessage('must be at least 6 characters');
  });

  it('shows error for mismatched passwords', () => {
    changePasswordPage.fillPasswordFields('wrongpassword', 'newpassword123', 'differentpassword');
    changePasswordPage.clickUpdatePassword();
    changePasswordPage.verifyErrorMessage('do not match');
  });

  it('shows error for same password', () => {
    changePasswordPage.fillPasswordFields(Cypress.env('TEST_PASSWORD'), Cypress.env('TEST_PASSWORD'), Cypress.env('TEST_PASSWORD'));
    changePasswordPage.clickUpdatePassword();
    changePasswordPage.verifyErrorMessage('must be different');
  });

  it('navigates back to dashboard', () => {
    changePasswordPage.clickBackToDashboard();
    changePasswordPage.verifyUrlContains('/dashboard');
  });
});
