import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ChangePasswordPage } from '../pages/ChangePasswordPage';

/**
 * Change Password Tests - Playwright
 * Tests for password change functionality
 */
test.describe('Change Password', () => {
  let loginPage: LoginPage;
  let changePasswordPage: ChangePasswordPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    changePasswordPage = new ChangePasswordPage(page);
    
    const email = process.env.TEST_EMAIL || '';
    const password = process.env.TEST_PASSWORD || '';
    
    // Skip all tests if credentials are not configured
    test.skip(!email || !password, 'Test credentials not configured');
    
    // Login and navigate to Change Password page
    await loginPage.visitLoginPage();
    await loginPage.login(email, password);
    await loginPage.verifySuccessfulLogin();
    await changePasswordPage.navigateToChangePassword();
  });

  test.afterEach(async () => {
    await changePasswordPage.clearStorage();
  });

  test('displays all form elements', async () => {
    await changePasswordPage.verifyFormElements();
  });

  test('shows error for empty fields', async () => {
    await changePasswordPage.clickUpdatePassword();
    await changePasswordPage.verifyErrorMessage('All fields are required');
  });

  test('shows error for short password', async () => {
    await changePasswordPage.fillPasswordFields('wrongpassword', '12345', '12345');
    await changePasswordPage.clickUpdatePassword();
    await changePasswordPage.verifyErrorMessage('must be at least 6 characters');
  });

  test('shows error for mismatched passwords', async () => {
    await changePasswordPage.fillPasswordFields('wrongpassword', 'newpassword123', 'differentpassword');
    await changePasswordPage.clickUpdatePassword();
    await changePasswordPage.verifyErrorMessage('do not match');
  });

  test('shows error for same password', async () => {
    const password = process.env.TEST_PASSWORD || '';
    await changePasswordPage.fillPasswordFields(password, password, password);
    await changePasswordPage.clickUpdatePassword();
    await changePasswordPage.verifyErrorMessage('must be different');
  });

  test('navigates back to dashboard', async () => {
    await changePasswordPage.clickBackToDashboard();
    await changePasswordPage.verifyUrlContains('/dashboard');
  });
});
