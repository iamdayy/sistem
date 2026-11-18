/**
 * base.page.ts
 *
 * Base page object with shared helpers used by all module pages. Encapsulates
 * navigation, alert handling, and waiting strategies so tests remain readable
 * and free of arbitrary fixed delays.
 *
 * Note on locators: the application's form labels are not bound to their
 * inputs via `for`/`id` and most inputs have no placeholder, so
 * `getByLabel`/`getByPlaceholder` do not work on the CRUD modals. The helper
 * `fillByLabelText` below uses XPath `following-sibling` to locate the input
 * that immediately follows a `<label>` with the given visible text.
 */
import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate to a route relative to the configured baseURL. */
  async goto(path: string) {
    await this.page.goto(path);
  }

  /** Wait for the page URL to contain the given fragment. */
  async waitForUrlContains(fragment: string) {
    await this.page.waitForURL((url) => url.pathname.includes(fragment));
  }

  /** The global success alert (green). The app styles alerts with Tailwind classes
   *  rather than role="alert", so we locate them by their stable styling class. */
  successAlert(): Locator {
    return this.page.locator('.bg-green-50.border.border-green-200.text-green-700').first();
  }

  /** The global error alert (red). */
  errorAlert(): Locator {
    return this.page.locator('.bg-red-50.border.border-red-200.text-red-700').first();
  }

  /** Wait until any alert disappears (useful after auto-dismissing messages). */
  async waitForNoError() {
    await expect(this.page.getByRole('alert')).toHaveCount(0);
  }

  /** Click a button/link by its accessible text. */
  async clickByText(text: string | RegExp) {
    await this.page.getByRole('button', { name: text }).click();
  }

  /**
   * Fill an input whose visible `<label>` text matches `labelText`.
   * Used for CRUD modals where labels are not bound via `for`/`id`.
   * Gets the label's parent element, then finds the input/textarea/select inside it.
   */
  async fillByLabelText(labelText: string | RegExp, value: string) {
    const text = String(labelText).replace(/'/g, "\\'");
    const parent = this.page.locator(`xpath=//label[contains(., '${text}')]/..`);
    const input = parent.locator('input, textarea, select').first();
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(value);
  }

  /** Check a checkbox whose adjacent label text matches. */
  async checkByLabelText(labelText: string | RegExp, checked = true) {
    const text = String(labelText).replace(/'/g, "\\'");
    const parent = this.page.locator(`xpath=//label[contains(., '${text}')]/..`);
    const box = parent.locator('input[type="checkbox"]').first();
    await box.waitFor({ state: 'visible', timeout: 5000 });
    if ((await box.isChecked()) !== checked) {
      await box.click();
    }
  }

  /** Select an option in a `<select>` whose adjacent label text matches. */
  async selectByLabelText(labelText: string | RegExp, value: string) {
    const text = String(labelText).replace(/'/g, "\\'");
    const grandparent = this.page.locator(`xpath=//label[contains(., '${text}')]/../..`);
    const select = grandparent.locator('select').first();
    await select.waitFor({ state: 'visible', timeout: 5000 });
    await select.selectOption(value);
  }

  /** Check that an element with the given role+name is visible. */
  async expectVisible(role: 'button' | 'link' | 'heading' | 'textbox' | 'table', name: string | RegExp) {
    await expect(this.page.getByRole(role, { name })).toBeVisible();
  }

  /** Check that the page contains the given text. */
  async expectText(text: string | RegExp) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  /** Check that the page does NOT contain the text. */
  async expectNoText(text: string | RegExp) {
    await expect(this.page.getByText(text)).not.toBeVisible();
  }
}
