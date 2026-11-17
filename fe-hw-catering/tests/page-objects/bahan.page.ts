/**
 * bahan.page.ts
 *
 * Page object for the Bahan (ingredients) management page (/bahan). Admin-only
 * CRUD with search. Labels are not bound via `for`/`id`, so inputs are located
 * through the visible label text (inherited fillByLabelText helper).
 */
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class BahanPage extends BasePage {
  readonly url = '/bahan';

  readonly heading: Locator = this.page.getByRole('heading', { name: /Manajemen Bahan/i });
  readonly addButton: Locator = this.page.getByRole('button', { name: /Tambah Bahan/i });
  readonly noDataText: Locator = this.page.getByText(/Tidak ada data bahan/i);
  readonly searchInput: Locator = this.page.getByPlaceholder(/Cari bahan/i);

  readonly modalSimpanButton: Locator = this.page.getByRole('button', { name: /^Simpan|Update$/i });
  readonly modalBatalButton: Locator = this.page.getByRole('button', { name: /Batal/i });

  // Bahan table row scoped by nama.
  row = (nama: string) => this.page.getByText(nama, { exact: true }).locator('..');
  editButton = (nama: string) => this.row(nama).getByRole('button', { name: /^Edit$/i });
  deleteButton = (nama: string) => this.row(nama).getByRole('button', { name: /Hapus/i });

  async goto() {
    await this.page.goto(this.url);
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible();
  }

  async fillBahanForm(data: { nama: string; satuan: string; harga_per_satuan: string | number }) {
    await this.fillByLabelText('Nama Bahan', data.nama);
    await this.fillByLabelText('Satuan', data.satuan);
    await this.fillByLabelText('Harga per Satuan', String(data.harga_per_satuan));
    await this.modalSimpanButton.click();
  }

  async expectBahanVisible(nama: string) {
    await expect(this.page.getByText(nama, { exact: true })).toBeVisible();
  }

  async expectBahanHidden(nama: string) {
    await expect(this.page.getByText(nama, { exact: true })).not.toBeVisible();
  }
}
