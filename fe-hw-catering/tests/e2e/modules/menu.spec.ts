import { test, expect } from '@playwright/test';
import { test as authTest, USERS, loginUser } from '../../fixtures/auth.fixture';
import { ApiClient } from '../../helpers/api-client';
import { MenuPage } from '../../page-objects/menu.page';
import { LayoutPage } from '../../page-objects/layout.page';
import { uniqueMenu } from '../../test-data/test-data';

const menuTests = authTest.extend<{ api: ApiClient }>({});

menuTests.describe('Menu Management (Black Box)', () => {
  let menuPage: MenuPage;
  let layoutPage: LayoutPage;
  let api: ApiClient;
  let adminToken: string;

  menuTests.beforeEach(async ({ page, apiContext, authenticate }) => {
    await authenticate(page, USERS.admin);
    const { token } = await loginUser(USERS.admin);
    api = new ApiClient(apiContext).withToken(token);
    adminToken = token;
    menuPage = new MenuPage(page);
    layoutPage = new LayoutPage(page);
  });

  async function createMenuViaApi() {
    const data = uniqueMenu();
    const reseps = await api.json(await api.get('/resep?per_page=1', adminToken));
    const resepId = (reseps as any).data.data[0].id;
    const formData = new FormData();
    formData.append('nama', data.nama);
    formData.append('deskripsi', data.deskripsi);
    formData.append('harga', String(data.harga));
    formData.append('kategori', data.kategori);
    formData.append('tersedia', '1');
    formData.append('resep[0][resep_id]', String(resepId));
    formData.append('resep[0][jumlah_porsi]', '1');
    const res = await api.postForm('/menu', formData, adminToken);
    const body = await api.json<any>(res);
    return { id: body.data.id, nama: data.nama };
  }

  menuTests('TC-MENU-001: admin can view the menu list', async ({ page }) => {
    await menuPage.goto();
    await menuPage.expectLoaded();
    await expect(menuPage.addButton).toBeVisible();
  });

  menuTests('TC-MENU-002: search filters menu results', async ({ page }) => {
    const { nama } = await createMenuViaApi();
    await menuPage.goto();
    await menuPage.expectLoaded();
    await menuPage.searchInput.fill(nama);
    await menuPage.searchInput.press('Enter');
    await menuPage.expectMenuVisible(nama);
    await api.del(`/menu/${(await api.json(await api.get('/menu?per_page=100', adminToken))).data.data.find((m: any) => m.nama === nama).id}`, adminToken);
  });

  menuTests('TC-MENU-003: kategori filter control is present', async ({ page }) => {
    await menuPage.goto();
    await menuPage.expectLoaded();
    await expect(menuPage.kategoriSelect).toBeVisible();
  });

  menuTests('TC-MENU-004: availability filter control is present', async ({ page }) => {
    await menuPage.goto();
    await menuPage.expectLoaded();
    await expect(menuPage.tersediaSelect).toBeVisible();
  });

  menuTests('TC-MENU-005: admin can create a menu (API setup + UI verify)', async ({ page }) => {
    const { nama, id } = await createMenuViaApi();
    await menuPage.goto();
    await menuPage.expectMenuVisible(nama);
    await api.del(`/menu/${id}`, adminToken);
  });

  menuTests('TC-MENU-006: admin can edit a menu via UI', async ({ page }) => {
    const { nama, id } = await createMenuViaApi();
    await menuPage.goto();
    await menuPage.expectMenuVisible(nama);
    await menuPage.editButton(nama).click();
    await menuPage.fillMenuForm({ nama: nama + ' (edit)', harga: 30000, kategori: 'Kategori Edit' });
    await expect(menuPage.page.getByText(nama + ' (edit)', { exact: true })).toBeVisible();
    await api.del(`/menu/${id}`, adminToken);
  });

  menuTests('TC-MENU-007: admin can toggle menu availability', async ({ page }) => {
    const { nama, id } = await createMenuViaApi();
    await menuPage.goto();
    await menuPage.expectMenuVisible(nama);
    await menuPage.toggleButton(nama).click();
    await expect(menuPage.page.getByText(/Tidak Tersedia/i)).toBeVisible();
    await menuPage.toggleButton(nama).click();
    await expect(menuPage.page.getByText(/Tersedia/i)).toBeVisible();
    await api.del(`/menu/${id}`, adminToken);
  });

  menuTests('TC-MENU-008: admin can delete a menu', async ({ page }) => {
    const { nama, id } = await createMenuViaApi();
    await menuPage.goto();
    await menuPage.expectMenuVisible(nama);
    menuPage.page.on('dialog', (dialog) => dialog.accept());
    await menuPage.deleteButton(nama).click();
    await menuPage.expectMenuHidden(nama);
  });

  menuTests('TC-MENU-009: staff cannot see the "Tambah Menu" action (authorization)', async ({ page, authenticate, staffUser }) => {
    await authenticate(page, staffUser);
    await menuPage.goto();
    await menuPage.expectLoaded();
    await menuPage.expectNoAdminActions();
  });
});
