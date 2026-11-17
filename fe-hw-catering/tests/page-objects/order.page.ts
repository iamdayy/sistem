/**
 * order.page.ts
 *
 * Page object for the Order management page (/order). Covers the order list,
 * search/status filter, add-order modal (pelanggan, dates, items), status
 * update, edit, and delete (pending only).
 */
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class OrderPage extends BasePage {
  readonly url = '/order';

  readonly heading: Locator = this.page.getByRole('heading', { name: /Manajemen Order/i });
  readonly addButton: Locator = this.page.getByRole('button', { name: /Tambah Order/i });
  readonly noDataText: Locator = this.page.getByText(/Tidak ada data order/i);
  readonly searchInput: Locator = this.page.getByPlaceholder(/Cari order/i);
  readonly statusFilter: Locator = this.page
    .getByText('Semua Status', { exact: true })
    .locator('..');

  orderRow = (nomorOrder: string) =>
    this.page.getByText(nomorOrder, { exact: true }).locator('..').locator('..');

  detailButton = (nomorOrder: string) =>
    this.page.getByRole('button', { name: /Detail/i }).first();
  updateStatusButton = (nomorOrder: string) =>
    this.page.getByRole('button', { name: /Update Status/i }).first();
  editButton = (nomorOrder: string) =>
    this.page.getByRole('button', { name: /^Edit$/i }).first();
  deleteButton = (nomorOrder: string) =>
    this.page.getByRole('button', { name: /Hapus/i }).first();

  readonly modalSimpanButton: Locator = this.page.getByRole('button', { name: /^Simpan|Update$/i });
  readonly modalBatalButton: Locator = this.page.getByRole('button', { name: /Batal/i });
  readonly modalTambahItemButton: Locator = this.page.getByRole('button', { name: /\+ Tambah Item/i });

  async goto() {
    await this.page.goto(this.url);
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible();
  }

  async openAddOrder() {
    await this.addButton.click();
  }

  async selectPelanggan(labelRegExp: string | RegExp) {
    await this.selectByLabelText('Pelanggan', labelRegExp);
  }

  async fillOrderForm(data: {
    tanggal_acara: string;
    waktu_acara: string;
    alamat_pengiriman: string;
    jumlah_tamu: string | number;
    catatan?: string;
  }) {
    await this.fillByLabelText('Tanggal Acara', data.tanggal_acara);
    await this.fillByLabelText('Waktu Acara', data.waktu_acara);
    await this.fillByLabelText('Alamat Pengiriman', data.alamat_pengiriman);
    await this.fillByLabelText('Jumlah Tamu', String(data.jumlah_tamu));
    if (data.catatan !== undefined) {
      await this.fillByLabelText('Catatan', data.catatan);
    }
  }

  async addItem() {
    await this.modalTambahItemButton.click();
  }

  /** Select a menu in the most recently added item row (by visible option text). */
  async selectItemMenu(labelRegExp: string | RegExp) {
    await this.page.locator('select').last().selectOption(labelRegExp);
  }

  async fillItemJumlah(value: string | number) {
    await this.page.getByPlaceholder('Jumlah').last().fill(String(value));
  }

  async expectOrderVisible(nomorOrder: string) {
    await expect(this.page.getByText(nomorOrder, { exact: true })).toBeVisible();
  }

  async expectOrderHidden(nomorOrder: string) {
    await expect(this.page.getByText(nomorOrder, { exact: true })).not.toBeVisible();
  }
}
