# Playwright Setup Guide for Beyhan Family Website

This document provides a comprehensive, step-by-step guide for setting up Playwright E2E testing alongside the existing Cypress test framework in this repository.

---

## Table of Contents
- [Overview](#overview)
- [Why Playwright + Cypress Together?](#why-playwright--cypress-together)
- [Step 1: Install Playwright](#step-1-install-playwright)
- [Step 2: Create Configuration File](#step-2-create-configuration-file)
- [Step 3: Set Up Folder Structure](#step-3-set-up-folder-structure)
- [Step 4: Create Base Page Object](#step-4-create-base-page-object)
- [Step 5: Create Page Objects](#step-5-create-page-objects)
- [Step 6: Create Test Files](#step-6-create-test-files)
- [Step 7: Configure Environment Variables](#step-7-configure-environment-variables)
- [Step 8: Add NPM Scripts](#step-8-add-npm-scripts)
- [Step 9: Update .gitignore](#step-9-update-gitignore)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Playwright vs Cypress Comparison](#playwright-vs-cypress-comparison)
- [Troubleshooting](#troubleshooting)

---

## Overview

**Date:** April 9, 2026  
**Playwright Version:** 1.59.1  
**Purpose:** Add Playwright E2E testing for login and change password features while keeping existing Cypress tests for other features.

Playwright and Cypress can coexist in the same repository without conflicts. They use:
- Separate configuration files
- Separate test directories
- Separate dependencies (no conflicts)
- Independent CLI commands

---

## Why Playwright + Cypress Together?

| Aspect | Cypress | Playwright |
|--------|---------|------------|
| **Browser Support** | Chrome, Edge, Firefox, Electron | Chrome, Firefox, Safari, Edge |
| **Mobile Emulation** | Limited | Native support |
| **API Testing** | Limited | Built-in |
| **Parallel Execution** | Paid feature | Free |
| **Debugging** | Time-travel debugging | Trace viewer |
| **Speed** | Good | Faster |

**Our Strategy:**
- Keep Cypress for existing tests (dashboard, trips, family tree, finance, etc.)
- Use Playwright for login and change password tests
- Evaluate which framework fits better for future features

---

## Step 1: Install Playwright

### 1.1 Install Playwright Test Package

```bash
# Using Yarn (recommended for this project)
yarn add -D @playwright/test

# Or using npm
npm install -D @playwright/test
```

**What this installs:**
- `@playwright/test` - The Playwright test runner
- `playwright` - Core Playwright library
- `playwright-core` - Browser automation core

### 1.2 Install Browsers

```bash
npx playwright install
```

**What this downloads:**
- Chromium (Chrome for Testing)
- Firefox
- WebKit (Safari)
- FFmpeg (for video recording)

**Installation locations (Windows):**
```
C:\Users\<username>\AppData\Local\ms-playwright\
├── chromium-1217/
├── firefox-1511/
├── webkit-2272/
└── ffmpeg-1011/
```

### 1.3 Install dotenv for Environment Variables

```bash
yarn add -D dotenv
```

This allows Playwright to read credentials from `.env` file.

---

## Step 2: Create Configuration File

Create `playwright.config.ts` in the project root:

```typescript
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Playwright Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './playwright/tests',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright/reports' }],
    ['list']
  ],

  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `page.goto('/')`
    baseURL: 'http://localhost:5173',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video recording
    video: 'on-first-retry',

    // Timeout for each action
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 30000,
  },

  // Global timeout for each test
  timeout: 60000,

  // Expect timeout
  expect: {
    timeout: 10000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to run tests in other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Output folder for test artifacts
  outputDir: 'playwright/test-results',
});
```

### Configuration Key Settings Explained

| Setting | Value | Purpose |
|---------|-------|---------|
| `testDir` | `./playwright/tests` | Where test files are located |
| `fullyParallel` | `true` | Run tests in parallel |
| `baseURL` | `http://localhost:5173` | Dev server URL |
| `trace` | `on-first-retry` | Capture trace on retry |
| `screenshot` | `only-on-failure` | Screenshot failed tests |
| `timeout` | `60000` | 60 second test timeout |
| `reporter` | `html`, `list` | Generate HTML report + console output |

---

## Step 3: Set Up Folder Structure

Create the following directory structure:

```
playwright/
├── pages/           # Page Object Model classes
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── ChangePasswordPage.ts
│   └── index.ts
├── tests/           # Test specifications
│   ├── login.spec.ts
│   └── changePassword.spec.ts
├── reports/         # HTML reports (gitignored)
└── test-results/    # Test artifacts (gitignored)
```

---

## Step 4: Create Base Page Object

The Base Page provides common methods inherited by all page objects.

**File: `playwright/pages/BasePage.ts`**

```typescript
import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object for Playwright
 * Contains common methods and utilities shared across all pages
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL path
   */
  async goto(path: string = '/'): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Get element by selector
   */
  getElement(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Get element by text content
   */
  getByText(text: string): Locator {
    return this.page.getByText(text);
  }

  /**
   * Get element by role
   */
  getByRole(role: Parameters<Page['getByRole']>[0], options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.page.getByRole(role, options);
  }

  /**
   * Get element by placeholder
   */
  getByPlaceholder(placeholder: string): Locator {
    return this.page.getByPlaceholder(placeholder);
  }

  /**
   * Click element by text
   */
  async clickByText(text: string): Promise<void> {
    await this.page.getByText(text).click();
  }

  /**
   * Clear browser storage (cookies and local storage)
   */
  async clearStorage(): Promise<void> {
    await this.page.context().clearCookies();
    // Only clear localStorage if we're on a real page (not about:blank)
    const url = this.page.url();
    if (url && !url.startsWith('about:')) {
      try {
        await this.page.evaluate(() => localStorage.clear());
      } catch {
        // Ignore errors if localStorage is not accessible
      }
    }
  }

  /**
   * Wait for specific duration in milliseconds
   */
  async wait(duration: number): Promise<void> {
    await this.page.waitForTimeout(duration);
  }

  /**
   * Reload the page
   */
  async reload(): Promise<void> {
    await this.page.reload();
  }

  /**
   * Verify URL contains specific path
   */
  async verifyUrlContains(path: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(path));
  }

  /**
   * Verify element with text exists and is visible
   */
  async verifyElementExists(text: string, options?: { timeout?: number }): Promise<void> {
    await expect(this.page.getByText(text).first()).toBeVisible(options);
  }

  /**
   * Verify element with text does not exist
   */
  async verifyElementNotExists(text: string): Promise<void> {
    await expect(this.page.getByText(text)).not.toBeVisible();
  }

  /**
   * Auto-confirm browser dialogs
   */
  setupDialogHandler(): void {
    this.page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `playwright/screenshots/${name}.png` });
  }
}
```

### Key Differences from Cypress BasePage

| Cypress | Playwright |
|---------|------------|
| `cy.visit(path)` | `await this.page.goto(path)` |
| `cy.get(selector)` | `this.page.locator(selector)` |
| `cy.contains(text)` | `this.page.getByText(text)` |
| `cy.wait(ms)` | `await this.page.waitForTimeout(ms)` |
| `.should('exist')` | `await expect(locator).toBeVisible()` |

---

## Step 5: Create Page Objects

### 5.1 Login Page Object

**File: `playwright/pages/LoginPage.ts`**

```typescript
import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Login Page Object for Playwright
 * Contains all locators and methods for the Login page
 */
export class LoginPage extends BasePage {
  // Locators
  private readonly emailInput = 'input[type="email"]';
  private readonly passwordInput = 'input[type="password"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Visit the login page
   */
  async visitLoginPage(): Promise<void> {
    await this.goto('/');
    await this.clearStorage();
  }

  /**
   * Enter email address
   */
  async enterEmail(email: string): Promise<void> {
    await this.page.locator(this.emailInput).clear();
    await this.page.locator(this.emailInput).fill(email);
  }

  /**
   * Enter password
   */
  async enterPassword(password: string): Promise<void> {
    await this.page.locator(this.passwordInput).clear();
    await this.page.locator(this.passwordInput).fill(password);
  }

  /**
   * Click Sign In button
   */
  async clickSignIn(): Promise<void> {
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }

  /**
   * Perform login with credentials
   */
  async login(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickSignIn();
  }

  /**
   * Verify all login page elements exist
   */
  async verifyLoginPageElements(): Promise<void> {
    await this.verifyElementExists('Beyhan Family');
    await expect(this.page.locator(this.emailInput)).toBeVisible();
    await expect(this.page.locator(this.passwordInput)).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage(message: string): Promise<void> {
    await this.verifyElementExists(message);
  }

  /**
   * Verify successful login by checking dashboard elements
   */
  async verifySuccessfulLogin(): Promise<void> {
    await this.verifyElementExists('Beyhan Family', { timeout: 10000 });
    await this.verifyUrlContains('/dashboard');
  }

  /**
   * Get email input element
   */
  getEmailInput() {
    return this.page.locator(this.emailInput);
  }

  /**
   * Get password input element
   */
  getPasswordInput() {
    return this.page.locator(this.passwordInput);
  }

  /**
   * Get sign in button
   */
  getSignInButton() {
    return this.page.getByRole('button', { name: 'Sign In' });
  }
}
```

### 5.2 Change Password Page Object

**File: `playwright/pages/ChangePasswordPage.ts`**

```typescript
import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Change Password Page Object for Playwright
 * Contains all locators and methods for the Change Password page
 */
export class ChangePasswordPage extends BasePage {
  // Locators
  private readonly passwordInputs = 'input[type="password"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Change Password page from dashboard
   */
  async navigateToChangePassword(): Promise<void> {
    await this.clickByText('Change Password');
    await this.verifyElementExists('Change Password', { timeout: 10000 });
  }

  /**
   * Get all password input fields
   */
  private getPasswordInputs() {
    return this.page.locator(this.passwordInputs);
  }

  /**
   * Enter current password
   */
  async enterCurrentPassword(password: string): Promise<void> {
    await this.getPasswordInputs().nth(0).fill(password);
  }

  /**
   * Enter new password
   */
  async enterNewPassword(password: string): Promise<void> {
    await this.getPasswordInputs().nth(1).fill(password);
  }

  /**
   * Enter confirm password
   */
  async enterConfirmPassword(password: string): Promise<void> {
    await this.getPasswordInputs().nth(2).fill(password);
  }

  /**
   * Fill all password fields
   */
  async fillPasswordFields(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    await this.enterCurrentPassword(currentPassword);
    await this.enterNewPassword(newPassword);
    await this.enterConfirmPassword(confirmPassword);
  }

  /**
   * Click Update Password button
   */
  async clickUpdatePassword(): Promise<void> {
    await this.page.getByRole('button', { name: 'Update Password' }).click();
  }

  /**
   * Click Back to Dashboard button
   */
  async clickBackToDashboard(): Promise<void> {
    await this.clickByText('Back to Dashboard');
  }

  /**
   * Verify all form elements exist
   */
  async verifyFormElements(): Promise<void> {
    // Verify there are 3 password input fields
    await expect(this.getPasswordInputs()).toHaveCount(3);
    await this.verifyElementExists('Current Password');
    await this.verifyElementExists('New Password');
    await this.verifyElementExists('Confirm New Password');
    await expect(this.page.getByRole('button', { name: 'Update Password' })).toBeVisible();
    await this.verifyElementExists('Back to Dashboard');
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage(message: string): Promise<void> {
    await expect(this.page.getByText(message)).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify success message is displayed
   */
  async verifySuccessMessage(message: string): Promise<void> {
    await expect(this.page.getByText(message)).toBeVisible({ timeout: 5000 });
  }
}
```

### 5.3 Index File for Exports

**File: `playwright/pages/index.ts`**

```typescript
/**
 * Playwright Page Object Model Index
 * Export all page objects for easy imports
 */
export { BasePage } from './BasePage';
export { LoginPage } from './LoginPage';
export { ChangePasswordPage } from './ChangePasswordPage';
```

---

## Step 6: Create Test Files

### 6.1 Login Tests

**File: `playwright/tests/login.spec.ts`**

```typescript
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
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(loginPage.getPasswordInput()).toHaveValue('secretpassword');
  });

  test('sign in button is clickable', async () => {
    await expect(loginPage.getSignInButton()).toBeEnabled();
  });

  test('page title contains Beyhan Family', async ({ page }) => {
    await expect(page.getByText('Beyhan Family').first()).toBeVisible();
  });
});
```

### 6.2 Change Password Tests

**File: `playwright/tests/changePassword.spec.ts`**

```typescript
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
```

### Test Structure Explained

```typescript
test.describe('Feature Name', () => {
  // Runs before each test
  test.beforeEach(async ({ page }) => {
    // Setup code
  });

  // Runs after each test
  test.afterEach(async () => {
    // Cleanup code
  });

  // Individual test
  test('test description', async () => {
    // Test code
  });
});
```

---

## Step 7: Configure Environment Variables

### 7.1 Update `.env` File

Add test credentials to your `.env` file:

```env
# Firebase Configuration (existing)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
...

# Playwright Test Credentials
TEST_EMAIL=your-test-email@example.com
TEST_PASSWORD=your-test-password
```

### 7.2 Update `.env.example`

Add documentation for new variables:

```env
# Playwright Test Credentials
# These are used by Playwright tests for authentication
TEST_EMAIL=your-test-email@example.com
TEST_PASSWORD=your-test-password
```

### Environment Variables Comparison

| Framework | File | Variable Format |
|-----------|------|-----------------|
| Cypress | `cypress.env.json` | `Cypress.env('TEST_EMAIL')` |
| Playwright | `.env` | `process.env.TEST_EMAIL` |

---

## Step 8: Add NPM Scripts

Update `package.json` with Playwright scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    
    "playwright:test": "playwright test",
    "playwright:ui": "playwright test --ui",
    "playwright:headed": "playwright test --headed",
    "playwright:report": "playwright show-report playwright/reports",
    
    "test:all": "npm run cypress:run && npm run playwright:test",
    
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write ."
  }
}
```

### Script Descriptions

| Script | Command | Description |
|--------|---------|-------------|
| `playwright:test` | `npx playwright test` | Run all tests headless |
| `playwright:ui` | `npx playwright test --ui` | Open interactive UI mode |
| `playwright:headed` | `npx playwright test --headed` | Run with visible browser |
| `playwright:report` | `npx playwright show-report` | View HTML report |
| `test:all` | Cypress + Playwright | Run both frameworks |

---

## Step 9: Update .gitignore

Add Playwright directories to `.gitignore`:

```gitignore
# Existing entries
node_modules
dist
cypress/screenshots
cypress/videos

# Playwright
playwright/test-results
playwright/reports
playwright/.cache

# Environment variables
.env
.env.local
.env.production
cypress.env.json
```

---

## Running Tests

### Prerequisites

**Start the development server first:**
```bash
npm run dev
```

### Run All Playwright Tests

```bash
# Headless mode (default)
npx playwright test

# Or using npm script
npm run playwright:test
```

### Run Specific Test File

```bash
npx playwright test login.spec.ts
npx playwright test changePassword.spec.ts
```

### Run with Visible Browser

```bash
npx playwright test --headed

# Or using npm script
npm run playwright:headed
```

### Interactive UI Mode

```bash
npx playwright test --ui

# Or using npm script
npm run playwright:ui
```

### Run in Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debug Mode

```bash
npx playwright test --debug
```

### View HTML Report

```bash
npx playwright show-report playwright/reports

# Or using npm script
npm run playwright:report
```

### Run Both Cypress and Playwright

```bash
npm run test:all
```

---

## Project Structure

After setup, your project structure should look like:

```
beyhan-family/
├── cypress/                    # Cypress tests (existing)
│   ├── e2e/
│   │   ├── dashboard.cy.ts
│   │   ├── familyTree.cy.ts
│   │   ├── trips.cy.ts
│   │   ├── familyPictures.cy.ts
│   │   ├── finance.cy.ts
│   │   └── ... other Cypress tests
│   ├── support/
│   │   └── pages/              # Cypress Page Objects
│   └── tsconfig.json
│
├── playwright/                 # Playwright tests (new)
│   ├── pages/
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   ├── ChangePasswordPage.ts
│   │   └── index.ts
│   ├── tests/
│   │   ├── login.spec.ts
│   │   └── changePassword.spec.ts
│   ├── reports/               # (gitignored)
│   └── test-results/          # (gitignored)
│
├── cypress.config.js          # Cypress config
├── playwright.config.ts       # Playwright config
├── package.json
├── .env                       # Environment variables
└── .gitignore
```

---

## Playwright vs Cypress Comparison

### API Differences

| Action | Cypress | Playwright |
|--------|---------|------------|
| Visit page | `cy.visit('/')` | `await page.goto('/')` |
| Find element | `cy.get('.class')` | `page.locator('.class')` |
| Find by text | `cy.contains('text')` | `page.getByText('text')` |
| Find by role | `cy.get('button')` | `page.getByRole('button')` |
| Click | `.click()` | `await locator.click()` |
| Type | `.type('text')` | `await locator.fill('text')` |
| Clear | `.clear()` | `await locator.clear()` |
| Assert visible | `.should('be.visible')` | `await expect(locator).toBeVisible()` |
| Assert text | `.should('have.text', 'x')` | `await expect(locator).toHaveText('x')` |
| Wait | `cy.wait(1000)` | `await page.waitForTimeout(1000)` |

### Test Structure

**Cypress:**
```typescript
describe('Feature', () => {
  beforeEach(() => { /* setup */ });
  
  it('test name', () => {
    // test code (no async/await)
  });
});
```

**Playwright:**
```typescript
test.describe('Feature', () => {
  test.beforeEach(async ({ page }) => { /* setup */ });
  
  test('test name', async () => {
    // test code (async/await required)
  });
});
```

### Environment Variables

**Cypress:**
```typescript
// cypress.env.json
{ "TEST_EMAIL": "email@example.com" }

// Usage
Cypress.env('TEST_EMAIL')
```

**Playwright:**
```typescript
// .env
TEST_EMAIL=email@example.com

// Usage (with dotenv)
process.env.TEST_EMAIL
```

---

## Troubleshooting

### Common Issues

#### 1. "SecurityError: Failed to read 'localStorage'"

**Problem:** Trying to clear localStorage before navigating to a page.

**Solution:** Navigate first, then clear storage:
```typescript
async visitLoginPage(): Promise<void> {
  await this.goto('/');        // Navigate first
  await this.clearStorage();   // Then clear storage
}
```

#### 2. "Test credentials not configured"

**Problem:** Environment variables not loaded.

**Solution:** Ensure `.env` file has `TEST_EMAIL` and `TEST_PASSWORD`.

#### 3. "Cannot find module '@playwright/test'"

**Problem:** Playwright not installed.

**Solution:**
```bash
yarn add -D @playwright/test
npx playwright install
```

#### 4. "Browser not found"

**Problem:** Browsers not installed.

**Solution:**
```bash
npx playwright install
```

#### 5. "Timeout waiting for element"

**Problem:** Element not appearing in time.

**Solution:** Increase timeout in config or use:
```typescript
await expect(locator).toBeVisible({ timeout: 10000 });
```

### Debug Commands

```bash
# Run with debug mode
npx playwright test --debug

# Run with trace viewer
npx playwright test --trace on

# Generate test code with codegen
npx playwright codegen http://localhost:5173
```

---

## CI/CD Integration

To run Playwright tests in GitHub Actions, add to your workflow:

```yaml
jobs:
  playwright-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: yarn install
        
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
        
      - name: Run Playwright tests
        run: npx playwright test
        env:
          TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
          TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
          
      - name: Upload Playwright Report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright/reports/
```

---

## Summary

| Item | Details |
|------|---------|
| **Playwright Version** | 1.59.1 |
| **Test Files** | 2 (login.spec.ts, changePassword.spec.ts) |
| **Page Objects** | 3 (BasePage, LoginPage, ChangePasswordPage) |
| **Total Tests** | 14 |
| **Execution Time** | ~17 seconds |
| **Browsers** | Chromium (default) |

**Playwright is now fully configured alongside Cypress!** Both frameworks can run independently or together using `npm run test:all`.

---

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Playwright VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
