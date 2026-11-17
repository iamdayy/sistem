/**
 * pelanggan.page.ts
 *
 * Page object for the Pelanggan (customers) management page (/pelanggan).
 * CRUD accessible to both admin and staff, with search and pagination.
 */
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class PelangganPage extends BasePage {
  readonly url = '/pelanggan';

  readonly heading: Locator = this.page.getByRole('heading', { name: /Manajemen Pelanggan/i });
  readonly addButton: Locator = this.page.getByRole('button', { name: /Tambah Pelanggan/i });
  readonly noDataText: Locator = this.page.getByText(/Tidak ada data pelanggan/i);
  readonly searchInput: Locator = this.page.getByPlaceholder(/Cari pelanggan/i);

  readonly modalSimpanButton: Locator = this.page.getByRole('button', { name: /^Simpan|Update$/i });
  readonly modalBatalButton: Locator = this.page.getByRole('button', { name: /Batal/i });

  row = (nama: string) => this.page.getByText(nama, { exact: true }).locator('..');
  editButton = (nama: string) => this.row(nama).getByRole('button', { name: /^Edit$/i });
  deleteButton = (nama: string) => this.row(nama).getByRole('button', { name: /Hapus/i });

  async goto() {
    await this.page.goto(this.url);
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible();
  }

  async fillPelangganForm(data: { nama: string; email: string; telepon: string; alamat?: string }) {
    await this.fillByLabelText('Nama', data.nama);
    await this.fillByLabelText('Email', data.email);
    await this.fillByLabelText('Telepon', data.telepon);
    if (data.alamat !== undefined) {
      await this.fillByLabelText('Alamat', data.alamat);
    }
    await this.modalSimpanButton.click();
  }

  async expectPelangganVisible(nama: string) {
    await expect(this.page.getByText(nama, { exact: true })).toBeVisible();
  }

  async expectPelangganHidden(nama: string) {
    await expect(this.page.getByText(nama, { exact: true })).not.toBeVisible();
  }
}
