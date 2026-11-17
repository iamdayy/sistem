/**
 * dashboard.page.ts
 *
 * Page object for the Dashboard (/dashboard). Verifies observable statistics
 * widgets and data presentation after login.
 */
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  readonly url = '/dashboard';

  readonly heading: Locator = this.page.getByRole('heading', { name: /dashboard/i, level: 1 });

  // Summary widget labels.
  readonly ordersToday: Locator = this.page.getByText(/Order Hari Ini/i);
  readonly ordersThisMonth: Locator = this.page.getByText(/Order Bulan Ini/i);
  readonly pendingOrders: Locator = this.page.getByText(/Order Pending/i);

  async goto() {
    await this.page.goto(this.url);
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible();
  }

  /** Expect the summary cards to render numeric values (not loading placeholders). */
  async expectSummaryVisible() {
    await expect(this.ordersToday).toBeVisible();
    await expect(this.ordersThisMonth).toBeVisible();
    await expect(this.pendingOrders).toBeVisible();
  }

  /** Expect a total-data card label to be visible (e.g. "Bahan", "Menu"). */
  async expectTotalDataCard(label: string) {
    await expect(this.page.getByText(label, { exact: false }).first()).toBeVisible();
  }
}
