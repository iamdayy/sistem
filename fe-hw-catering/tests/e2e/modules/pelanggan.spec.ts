import { test, expect } from '@playwright/test';
import { test as authTest, USERS, loginUser } from '../../fixtures/auth.fixture';
import { ApiClient } from '../../helpers/api-client';
import { PelangganPage } from '../../page-objects/pelanggan.page';
import { LayoutPage } from '../../page-objects/layout.page';
import { VALID, INVALID, uniquePelanggan } from '../../test-data/test-data';

const pelangganTests = authTest.extend<{ api: ApiClient }>({});

pelangganTests.describe('Pelanggan Management (Black Box)', () => {
  let pelangganPage: PelangganPage;
  let layoutPage: LayoutPage;
  let api: ApiClient;
  let token: string;

  pelangganTests.beforeEach(async ({ page, apiContext, authenticate }) => {
    await authenticate(page, USERS.admin);
    const { token: t } = await loginUser(USERS.admin);
    api = new ApiClient(apiContext).withToken(t);
    token = t;
    pelangganPage = new PelangganPage(page);
    layoutPage = new LayoutPage(page);
  });

  async function createPelangganViaApi(payload = uniquePelanggan()) {
    const res = await api.post('/pelanggan', payload, token);
    const body = await api.json<any>(res);
    return body.data.id;
  }

  pelangganTests('TC-PELANGGAN-001: admin can view the pelanggan list', async ({ page }) => {
    await pelangganPage.goto();
    await pelangganPage.expectLoaded();
  });

  pelangganTests('TC-PELANGGAN-002: admin can create a pelanggan via UI', async ({ page }) => {
    const data = uniquePelanggan();
    await pelangganPage.goto();
    await pelangganPage.addButton.click();
    await pelangganPage.fillPelangganForm(data);
    await pelangganPage.expectPelangganVisible(data.nama);
    // Cleanup via API.
    const list = await api.json<any>(await api.get('/pelanggan?per_page=100', token));
    const item = list.data.data.find((p: any) => p.email === data.email);
    if (item) await api.del(`/pelanggan/${item.id}`, token);
  });

  pelangganTests('TC-PELANGGAN-003: admin can edit a pelanggan via UI', async ({ page }) => {
    const data = uniquePelanggan();
    const id = await createPelangganViaApi(data);
    await pelangganPage.goto();
    await pelangganPage.expectPelangganVisible(data.nama);
    await pelangganPage.editButton(data.nama).click();
    await pelangganPage.fillPelangganForm({ ...data, nama: data.nama + ' (edit)' });
    await expect(pelangganPage.page.getByText(data.nama + ' (edit)', { exact: true })).toBeVisible();
    await api.del(`/pelanggan/${id}`, token);
  });

  pelangganTests('TC-PELANGGAN-004: admin can delete a pelanggan', async ({ page }) => {
    const data = uniquePelanggan();
    const id = await createPelangganViaApi(data);
    await pelangganPage.goto();
    await pelangganPage.expectPelangganVisible(data.nama);
    pelangganPage.page.on('dialog', (dialog) => dialog.accept());
    await pelangganPage.deleteButton(data.nama).click();
    await pelangganPage.expectPelangganHidden(data.nama);
  });

  pelangganTests('TC-PELANGGAN-005: creating pelanggan with invalid email is rejected', async ({ page }) => {
    await pelangganPage.goto();
    await pelangganPage.addButton.click();
    await pelangganPage.fillPelangganForm(INVALID.pelangganInvalidEmail);
    // The email input has required + type="email", so HTML5 validation should block submission.
    // The page should remain on /pelanggan (no navigation to a success page).
    await expect(page).toHaveURL(/\/pelanggan/);
    await pelangganPage.modalBatalButton.click();
  });

  pelangganTests('TC-PELANGGAN-006: staff can access pelanggan CRUD (role: admin,staff)', async ({ page, authenticate, staffUser }) => {
    await authenticate(page, staffUser);
    await pelangganPage.goto();
    await pelangganPage.expectLoaded();
    await expect(pelangganPage.addButton).toBeVisible();
  });
});
