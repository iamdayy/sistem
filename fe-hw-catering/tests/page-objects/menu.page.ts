/**
 * menu.page.ts
 *
 * Page object for the Menu management page (/menu). Covers the observable CRUD
 * behaviour, search/filter, availability toggle, and admin-only action buttons.
 */
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class MenuPage extends BasePage {
  readonly url = '/menu';

  readonly heading: Locator = this.page.getByRole('heading', { name: /Manajemen Menu/i });
  readonly addButton: Locator = this.page.getByRole('button', { name: /Tambah Menu/i });

  // Search / filters (the filter <select>s have no associated <label>, so we
  // locate them via their first option's visible text).
  readonly searchInput: Locator = this.page.getByPlaceholder(/Cari menu/i);
  readonly kategoriSelect: Locator = this.page
    .getByText('Semua Kategori', { exact: true })
    .locator('..');
  readonly tersediaSelect: Locator = this.page
    .getByText('Semua Status', { exact: true })
    .locator('..');

  // Menu card located by its nama heading.
  menuCard = (nama: string) =>
    this.page.getByRole('heading', { name: nama, level: 3 }).locator('..').locator('..');

  readonly noDataText: Locator = this.page.getByText(/Tidak ada data menu/i);

  // Action buttons scoped within the specific menu card (admin only).
  toggleButton = (nama: string) => this.menuCard(nama).getByRole('button', { name: /Toggle Status/i });
  editButton = (nama: string) => this.menuCard(nama).getByRole('button', { name: /^Edit$/i });
  deleteButton = (nama: string) => this.menuCard(nama).getByRole('button', { name: /Hapus/i });

  // Modal form fields (labels are not bound via `for`/`id`).
  readonly modalNamaInput = this.page.locator('label', { hasText: 'Nama Menu' }).first().locator('..').locator('input').first();
  readonly modalHargaInput = this.page.locator('label', { hasText: 'Harga' }).first().locator('..').locator('input').first();
  readonly modalKategoriInput = this.page.locator('label', { hasText: 'Kategori' }).first().locator('..').locator('input').first();
  readonly modalDeskripsiInput = this.page.locator('label', { hasText: 'Deskripsi' }).first().locator('..').locator('textarea').first();
  readonly modalFotoInput = this.page.locator('label', { hasText: 'Foto' }).first().locator('..').locator('input[type="file"]').first();
  readonly modalTersediaCheckbox = this.page.locator('label', { hasText: 'Tersedia' }).first().locator('..').locator('input[type="checkbox"]').first();
  readonly modalSimpanButton: Locator = this.page.getByRole('button', { name: /^Simpan|Update$/i });
  readonly modalBatalButton: Locator = this.page.getByRole('button', { name: /Batal/i });

  async goto() {
    await this.page.goto(this.url);
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible();
  }

  async openAddModal() {
    await this.addButton.click();
  }

  /** Fill the menu create/edit form (admin fields). */
  async fillMenuForm(data: {
    nama: string;
    harga: string | number;
    kategori: string;
    deskripsi?: string;
    tersedia?: boolean;
  }) {
    await this.fillByLabelText('Nama Menu', data.nama);
    await this.fillByLabelText('Harga', String(data.harga));
    await this.fillByLabelText('Kategori', data.kategori);
    if (data.deskripsi !== undefined) {
      await this.fillByLabelText('Deskripsi', data.deskripsi);
    }
    if (data.tersedia !== undefined) {
      await this.checkByLabelText('Tersedia', data.tersedia);
    }
    await this.modalSimpanButton.click();
  }

  async expectMenuVisible(nama: string) {
    await expect(this.page.getByRole('heading', { name: nama, level: 3 })).toBeVisible();
  }

  async expectMenuHidden(nama: string) {
    await expect(this.page.getByRole('heading', { name: nama, level: 3 })).not.toBeVisible();
  }

  /** Expect an admin-only action to be absent (staff authorization boundary). */
  async expectNoAdminActions() {
    await expect(this.addButton).not.toBeVisible();
  }
}
