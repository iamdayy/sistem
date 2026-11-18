/**
 * order-detail.page.ts
 *
 * Page object for the Order detail page (/order/:id). Covers order information,
 * payment (DP / full), status update, invoice preview/download, and rincian
 * belanja.
 */
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class OrderDetailPage extends BasePage {
  readonly heading: Locator = this.page.getByRole('heading', { name: /Detail Order/i });

  readonly backLink: Locator = this.page.getByRole('link', { name: /Kembali ke List Order/i });
  readonly previewInvoiceButton: Locator = this.page.getByRole('button', { name: /Preview Invoice/i });
  readonly downloadInvoiceButton: Locator = this.page.getByRole('button', { name: /Download Invoice/i });
  readonly updateStatusButton: Locator = this.page.getByRole('button', { name: /Update Status/i });

  readonly bayarDPButton: Locator = this.page.getByRole('button', { name: /Bayar DP/i });
  readonly lunasiButton: Locator = this.page.getByRole('button', { name: /Bayar Lunas|Lunasi/i });

  async expectLoaded(nomorOrder?: string) {
    await expect(this.heading).toBeVisible();
    if (nomorOrder) {
      await expect(this.page.getByText(nomorOrder, { exact: false })).toBeVisible();
    }
  }

  async expectStatus(status: string) {
    await expect(this.page.getByText(status, { exact: false })).toBeVisible();
  }

  async expectPayment(status: string) {
    await expect(this.page.locator('span').filter({ hasText: status, exact: false }).first()).toBeVisible();
  }

  async expectPaymentLunas() {
    await expect(this.page.getByText('✓ Sudah Lunas')).toBeVisible();
  }

  async expectTotalHarga(amount: string | number) {
    await expect(this.page.getByText(`Rp ${amount}`, { exact: false })).toBeVisible();
  }

  async updateStatusViaModal(newStatus: string) {
    await this.updateStatusButton.click();
    await this.selectByLabelText('Status', newStatus);
    // Scope to modal dialog to avoid matching the page-level button.
    await this.page.locator('div.fixed.inset-0').getByRole('button', { name: /Update Status/i }).click();
  }

  async payDP(amount: string | number) {
    await this.bayarDPButton.click();
    await this.fillByLabelText('Jumlah DP', String(amount));
    await this.page.locator('div.fixed.inset-0').getByRole('button', { name: /Bayar DP/i }).click();
  }

  async payFull() {
    await this.lunasiButton.click();
    await this.page.locator('div.fixed.inset-0').getByRole('button', { name: /Lunasi/i }).click();
  }
}
