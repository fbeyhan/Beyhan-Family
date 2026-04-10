import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

/**
 * Login Page Tests - Playwright
 * Tests for authentication functionality
 */
test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.visitLoginPage();
  });

  test('displays login page with all elements', async () => {
    await loginPage.verifyLoginPageElements();
  });

  test('shows error on empty credentials', async () => {
    await loginPage.clickSignIn();
    await loginPage.verifyErrorMessage('Email and password are required');
  });

  test('shows error on invalid credentials', async () => {
    await loginPage.login('wrong@email.com', 'wrongpass');
    await loginPage.verifyErrorMessage('Invalid email or password');
  });

  test('logs in with valid credentials', async () => {
    const email = process.env.TEST_EMAIL || '';
    const password = process.env.TEST_PASSWORD || '';
    
    // Skip test if credentials are not configured
    test.skip(!email || !password, 'Test credentials not configured');
    
    await loginPage.login(email, password);
    await loginPage.verifySuccessfulLogin();
  });

  test('email input accepts valid email format', async () => {
    await loginPage.enterEmail('test@example.com');
    await expect(loginPage.getEmailInput()).toHaveValue('test@example.com');
  });

  test('password input masks characters', async ({ page }) => {
    await loginPage.enterPassword('secretpassword');
    // Password input should be of type "password" which masks input
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(loginPage.getPasswordInput()).toHaveValue('secretpassword');
  });

  test('sign in button is clickable', async () => {
    await expect(loginPage.getSignInButton()).toBeEnabled();
  });

  test('page title contains Beyhan Family', async ({ page }) => {
    // Check the page has the title or header
    await expect(page.getByText('Beyhan Family').first()).toBeVisible();
  });
});
