import { LoginPage } from '../support/pages/LoginPage';

describe('Login Page', () => {
  const loginPage = new LoginPage();

  beforeEach(() => {
    loginPage.visitLoginPage();
  });

  it('displays login page with all elements', () => {
    loginPage.verifyLoginPageElements();
  });

  it('shows error on empty credentials', () => {
    loginPage.clickSignIn();
    loginPage.verifyErrorMessage('Email and password are required');
  });

  it('shows error on invalid credentials', () => {
    loginPage.login('wrong@email.com', 'wrongpass');
    loginPage.verifyErrorMessage('Invalid email or password');
  });

  it('logs in with valid credentials', () => {
    loginPage.login(Cypress.env('TEST_EMAIL'), Cypress.env('TEST_PASSWORD'));
    loginPage.verifySuccessfulLogin();
  });
});
