import { test, expect } from '@playwright/test';
import { test as authTest, USERS, loginUser } from '../../fixtures/auth.fixture';
import { ApiClient } from '../../helpers/api-client';

const resepTests = authTest.extend<{ api: ApiClient }>({});

resepTests.describe('Resep Management (Black Box)', () => {
  let api: ApiClient;
  let token: string;

  resepTests.beforeEach(async ({ page, apiContext, authenticate }) => {
    await authenticate(page, USERS.admin);
    const { token: t } = await loginUser(USERS.admin);
    api = new ApiClient(apiContext).withToken(t);
    token = t;
  });

  resepTests('TC-RESEP-001: admin can view the resep list', async ({ page }) => {
    await page.goto('/resep');
    await expect(page.getByRole('heading', { name: /Manajemen Resep/i })).toBeVisible();
  });

  resepTests('TC-RESEP-002: admin can create a resep via UI', async ({ page }) => {
    // Ensure a bahan exists for the resep composition.
    const bahan = await api.json<any>(
      await api.post(
        '/bahan',
        { nama: 'Bahan Resep Uji', satuan: 'kg', harga_per_satuan: 10000 },
        token,
      ),
    );
    await page.goto('/resep');
    await page.getByRole('button', { name: /Tambah Resep/i }).click();
    await page.getByLabel(/Nama Resep|^Nama$/i).fill('Resep Uji');
    await page.getByLabel(/Deskripsi/i).fill('Deskripsi resep uji');
    await page.getByLabel(/Porsi/i).fill('4');
    // Add at least one bahan (client requires min 1).
    await page.getByRole('button', { name: /\+ Tambah Bahan/i }).click();
    await page.locator('select').last().selectOption({ label: /Bahan Resep Uji/i });
    await page.getByPlaceholder(/Jumlah/i).last().fill('1');
    await page.getByRole('button', { name: /^Simpan|Update$/i }).click();
    await expect(page.getByText('Resep Uji', { exact: false })).toBeVisible();
    // Cleanup.
    await api.del(`/bahan/${bahan.data.id}`, token);
  });

  resepTests('TC-RESEP-003: staff can read resep but cannot create (authorization)', async ({ page, authenticate, staffUser }) => {
    await authenticate(page, staffUser);
    await page.goto('/resep');
    await expect(page.getByRole('heading', { name: /Manajemen Resep/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Tambah Resep/i })).not.toBeVisible();
  });

  resepTests('TC-RESEP-004: hitung-biaya returns a cost breakdown (API-assisted)', async ({}) => {
    const bahan = await api.json<any>(
      await api.post(
        '/bahan',
        { nama: 'Bahan Biaya Uji', satuan: 'kg', harga_per_satuan: 5000 },
        token,
      ),
    );
    const resep = await api.json<any>(
      await api.post(
        '/resep',
        {
          nama: 'Resep Biaya Uji',
          porsi: 2,
          bahan: [{ bahan_id: bahan.data.id, jumlah: 1, satuan: 'kg' }],
        },
        token,
      ),
    );
    const biaya = await api.json<any>(
      await api.get(`/resep/${resep.data.id}/hitung-biaya`, token),
    );
    expect(biaya.data.total_biaya).toBeGreaterThan(0);
    expect(biaya.data.biaya_per_porsi).toBeGreaterThan(0);
    await api.del(`/resep/${resep.data.id}`, token);
    await api.del(`/bahan/${bahan.data.id}`, token);
  });
});
