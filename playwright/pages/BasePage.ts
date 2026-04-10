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
