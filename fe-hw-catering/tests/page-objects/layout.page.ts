/**
 * layout.page.ts
 *
 * Page object for the shared application layout: sidebar navigation and the
 * logout button in the header. Used to navigate between modules and to sign out.
 */
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LayoutPage extends BasePage {
  readonly logoutButton: Locator = this.page.getByRole('button', { name: /logout/i });
  readonly sidebar: Locator = this.page.getByRole('navigation');

  /** Navigate to a module by clicking its sidebar link text. */
  async goToModule(name: string) {
    await this.page.getByRole('link', { name }).click();
  }

  /** Expect a sidebar link for the given module to be visible. */
  async expectModuleLink(name: string) {
    await expect(this.page.getByRole('link', { name })).toBeVisible();
  }

  /** Expect the sidebar link to be hidden (authorization boundary). */
  async expectNoModuleLink(name: string) {
    await expect(this.page.getByRole('link', { name })).not.toBeVisible();
  }

  async logout() {
    await this.logoutButton.click();
  }

  /** Expect to be redirected to the login page after logout. */
  async expectOnLogin() {
    await expect(this.page).toHaveURL(/\/login/);
  }
}
