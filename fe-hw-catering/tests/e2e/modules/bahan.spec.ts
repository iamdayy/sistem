import { test, expect } from '@playwright/test';
import { test as authTest, USERS, loginUser } from '../../fixtures/auth.fixture';
import { ApiClient } from '../../helpers/api-client';
import { BahanPage } from '../../page-objects/bahan.page';
import { LayoutPage } from '../../page-objects/layout.page';
import { INVALID, uniqueBahan } from '../../test-data/test-data';

const bahanTests = authTest.extend<{ api: ApiClient }>({});

bahanTests.describe('Bahan Management (Black Box)', () => {
  let bahanPage: BahanPage;
  let layoutPage: LayoutPage;
  let api: ApiClient;
  let adminToken: string;

  bahanTests.beforeEach(async ({ page, apiContext, authenticate }) => {
    await authenticate(page, USERS.admin);
    const { token } = await loginUser(USERS.admin);
    api = new ApiClient(apiContext).withToken(token);
    adminToken = token;
    bahanPage = new BahanPage(page);
    layoutPage = new LayoutPage(page);
  });

  async function createBahanViaApi(payload = uniqueBahan()) {
    const res = await api.post('/bahan', payload, adminToken);
    const body = await api.json<any>(res);
    return body.data.id;
  }

  bahanTests('TC-BAHAN-001: admin can view the bahan list', async ({ page }) => {
    await bahanPage.goto();
    await bahanPage.expectLoaded();
    await expect(bahanPage.addButton).toBeVisible();
  });

  bahanTests('TC-BAHAN-002: admin can create a bahan (API setup + UI verify)', async ({ page }) => {
    const data = uniqueBahan();
    await createBahanViaApi(data);
    await bahanPage.goto();
    await bahanPage.expectBahanVisible(data.nama);
    const list = await api.json<any>(await api.get('/bahan?per_page=100', adminToken));
    const item = list.data.data.find((b: any) => b.nama === data.nama);
    if (item) await api.del(`/bahan/${item.id}`, adminToken);
  });

  bahanTests('TC-BAHAN-003: search filters bahan results', async ({ page }) => {
    const data = uniqueBahan();
    await createBahanViaApi(data);
    await bahanPage.goto();
    await bahanPage.expectLoaded();
    await bahanPage.searchInput.fill(data.nama);
    await bahanPage.searchInput.press('Enter');
    await bahanPage.expectBahanVisible(data.nama);
    const list = await api.json<any>(await api.get('/bahan?per_page=100', adminToken));
    const item = list.data.data.find((b: any) => b.nama === data.nama);
    if (item) await api.del(`/bahan/${item.id}`, adminToken);
  });

  bahanTests('TC-BAHAN-004: admin can edit a bahan via UI', async ({ page }) => {
    const data = uniqueBahan();
    const id = await createBahanViaApi(data);
    await bahanPage.goto();
    await bahanPage.expectBahanVisible(data.nama);
    await bahanPage.editButton(data.nama).click();
    await bahanPage.fillBahanForm({ nama: data.nama + ' (edit)', satuan: 'pcs', harga_per_satuan: 20000 });
    await expect(bahanPage.page.getByText(data.nama + ' (edit)', { exact: true })).toBeVisible();
    await api.del(`/bahan/${id}`, adminToken);
  });

  bahanTests('TC-BAHAN-005: admin can delete a bahan', async ({ page }) => {
    const data = uniqueBahan();
    await createBahanViaApi(data);
    await bahanPage.goto();
    await bahanPage.expectBahanVisible(data.nama);
    bahanPage.page.on('dialog', (dialog) => dialog.accept());
    await bahanPage.deleteButton(data.nama).click();
    await bahanPage.expectBahanHidden(data.nama);
  });

  bahanTests('TC-BAHAN-006: creating bahan with negative harga is rejected (negative)', async ({ page }) => {
    await bahanPage.goto();
    await bahanPage.addButton.click();
    await bahanPage.fillBahanForm({ nama: INVALID.bahanNegativeHarga.nama, satuan: INVALID.bahanNegativeHarga.satuan, harga_per_satuan: INVALID.bahanNegativeHarga.harga_per_satuan });
    await expect(bahanPage.errorAlert()).toBeVisible();
    await bahanPage.modalBatalButton.click();
  });
});
