/**
 * login.page.ts
 *
 * Page object for the Login page (/login). Covers the observable behaviour of
 * the authentication form: valid/invalid credentials, missing fields, and the
 * redirect to the dashboard after successful login.
 */
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly url = '/login';

  // Form fields (matched by associated label / placeholder where available).
  readonly emailInput: Locator = this.page.getByLabel('Email');
  readonly passwordInput: Locator = this.page.getByLabel('Password');
  readonly loginButton: Locator = this.page.getByRole('button', { name: /login/i });
  readonly errorAlert: Locator = this.page.locator('.bg-red-50.border.border-red-200.text-red-700').first();

  readonly pageHeading: Locator = this.page.getByRole('heading', { name: /login/i });

  async goto() {
    await this.page.goto(this.url);
  }

  /** Fill email and password, then click Login. */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Submit the form without filling anything (missing required fields). */
  async submitEmpty() {
    await this.loginButton.click();
  }

  /** Expect the login heading to be visible (page loaded). */
  async expectLoaded() {
    await expect(this.pageHeading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /** Expect an error alert containing the given message fragment. */
  async expectError(messageFragment: string) {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText(messageFragment);
  }

  /** Expect no error alert to be present. */
  async expectNoError() {
    await expect(this.errorAlert).not.toBeVisible();
  }
}
