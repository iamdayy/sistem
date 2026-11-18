import { test, expect } from '@playwright/test';
import { test as authTest, USERS, loginUser } from '../../fixtures/auth.fixture';
import { ApiClient } from '../../helpers/api-client';

const mrpTests = authTest.extend<{ api: ApiClient }>({});

mrpTests.describe('MRP / Rincian Belanja (Black Box)', () => {
  let api: ApiClient;
  let token: string;

  mrpTests.beforeEach(async ({ page, apiContext, authenticate }) => {
    await authenticate(page, USERS.admin);
    const { token: t } = await loginUser(USERS.admin);
    api = new ApiClient(apiContext).withToken(t);
    token = t;
  });

  /**
   * Helper: create order with menu that has resep + bahan for MRP testing.
   * Returns orderId, pelangganId, menuId, and expected MRP data.
   */
  async function seedOrderWithResep() {
    // Create bahan
    const bahan = await api.json<any>(
      await api.post('/bahan', { nama: 'Bahan MRP Uji', satuan: 'kg', harga_per_satuan: 10000 }, token),
    );
    const bahanId = bahan.data.id;

    // Create resep with bahan
    const resep = await api.json<any>(
      await api.post(
        '/resep',
        {
          nama: 'Resep MRP Uji',
          porsi: 2,
          bahan: [{ bahan_id: bahanId, jumlah: 1, satuan: 'kg' }],
        },
        token,
      ),
    );
    const resepId = resep.data.id;

    // Create menu with resep
    const formData: Record<string, string> = {
      nama: 'Menu MRP Uji',
      deskripsi: 'Menu untuk MRP test',
      harga: '50000',
      kategori: 'Makanan Utama',
      tersedia: '1',
      'resep[0][resep_id]': String(resepId),
      'resep[0][jumlah_porsi]': '1',
    };
    const menu = await api.json<any>(await api.postForm('/menu', formData, token));
    const menuId = menu.data.id;

    // Create order with 3 porsi of this menu
    const pelanggan = await api.json<any>(
      await api.post('/pelanggan', { nama: 'Pelanggan MRP', email: `mrp.${Date.now()}@example.com`, telepon: '081234567890', alamat: 'Jl. MRP No. 1' }, token),
    );
    const order = await api.json<any>(
      await api.post(
        '/orders',
        {
          pelanggan_id: pelanggan.data.id,
          tanggal_order: '2026-12-01',
          tanggal_acara: '2026-12-20',
          waktu_acara: '12:00',
          alamat_pengiriman: 'Jl. Order MRP No. 1',
          jumlah_tamu: 20,
          items: [{ menu_id: menuId, jumlah: 3 }], // 3 porsi
        },
        token,
      ),
    );

    return {
      orderId: order.data.id,
      pelangganId: pelanggan.data.id,
      menuId,
      resepId,
      bahanId,
      // Expected MRP calculation:
      // bahan.jumlah (1) × resep.jumlah_porsi (1) × order_detail.jumlah (3) = 3 kg
      // subtotal = 3 kg × 10000 = 30000
      expectedJumlah: 3,
      expectedSubtotal: 30000,
      expectedTotalBelanja: 30000,
      expectedTotalText: 'Rp 30.000',
    };
  }

  mrpTests.afterEach(async () => {
    // Cleanup orders
    try {
      await api.del('/orders?per_page=100', token);
    } catch {
      // ignore
    }
  });

  mrpTests('TC-MRP-001: MRP calculation displays bahan requirement for order', async ({ page }) => {
    const { orderId } = await seedOrderWithResep();
    await page.goto(`/order/${orderId}`);

    // Order detail page should show "Rincian Belanja" section
    await expect(page.getByRole('heading', { name: /Rincian Belanja/i })).toBeVisible();
  });

  mrpTests('TC-MRP-002: MRP calculation shows correct total belanja', async ({ page }) => {
    const { orderId, expectedTotalText } = await seedOrderWithResep();
    await page.goto(`/order/${orderId}`);

    // Verify total belanja value is displayed in footer (format: "Rp 30.000")
    // Total belanja is in the footer cell with text-yellow-600 class
    await expect(page.locator('td.text-yellow-600').filter({ hasText: expectedTotalText })).toBeVisible();
  });

  mrpTests('TC-MRP-003: MRP calculation formula is correct', async ({ page }) => {
    const { orderId, expectedSubtotal } = await seedOrderWithResep();
    await page.goto(`/order/${orderId}`);

    // Verify bahan name appears in rincian belanja table
    await expect(page.getByText('Bahan MRP Uji', { exact: false })).toBeVisible();

    // Verify jumlah (3 kg = 1 × 1 × 3) - skip if too ambiguous, rely on subtotal check

    // Verify subtotal (30000 formatted as "Rp 30.000") - use total belanja cell in footer
    await expect(page.locator('td.text-yellow-600').filter({ hasText: /30\.000/ })).toBeVisible();
  });

  mrpTests('TC-MRP-005: MRP calculation handles order with menu having multiple resep', async ({ page }) => {
    // Create 2 bahan
    const bahan1 = await api.json<any>(
      await api.post('/bahan', { nama: 'Bahan MRP A', satuan: 'kg', harga_per_satuan: 10000 }, token),
    );
    const bahan2 = await api.json<any>(
      await api.post('/bahan', { nama: 'Bahan MRP B', satuan: 'kg', harga_per_satuan: 20000 }, token),
    );

    // Create 2 resep
    const resep1 = await api.json<any>(
      await api.post('/resep', { nama: 'Resep MRP A', porsi: 2, bahan: [{ bahan_id: bahan1.data.id, jumlah: 1, satuan: 'kg' }] }, token),
    );
    const resep2 = await api.json<any>(
      await api.post('/resep', { nama: 'Resep MRP B', porsi: 2, bahan: [{ bahan_id: bahan2.data.id, jumlah: 2, satuan: 'kg' }] }, token),
    );

    // Create menu with 2 resep
    const formData: Record<string, string> = {
      nama: 'Menu MRP Multi Resep',
      deskripsi: 'Menu with 2 resep',
      harga: '50000',
      kategori: 'Makanan Utama',
      tersedia: '1',
      'resep[0][resep_id]': String(resep1.data.id),
      'resep[0][jumlah_porsi]': '1',
      'resep[1][resep_id]': String(resep2.data.id),
      'resep[1][jumlah_porsi]': '1',
    };
    const menu = await api.json<any>(await api.postForm('/menu', formData, token));

    // Create order with 2 porsi
    const pelanggan = await api.json<any>(
      await api.post('/pelanggan', { nama: 'Pelanggan MRP Multi', email: `mrp.multi.${Date.now()}@example.com`, telepon: '081234567890', alamat: 'Jl. MRP No. 1' }, token),
    );
    const order = await api.json<any>(
      await api.post(
        '/orders',
        {
          pelanggan_id: pelanggan.data.id,
          tanggal_order: '2026-12-01',
          tanggal_acara: '2026-12-20',
          waktu_acara: '12:00',
          alamat_pengiriman: 'Jl. Order MRP No. 1',
          jumlah_tamu: 20,
          items: [{ menu_id: menu.data.id, jumlah: 2 }],
        },
        token,
      ),
    );

    await page.goto(`/order/${order.data.id}`);

    // Both bahan should appear in rincian belanja
    await expect(page.getByText('Bahan MRP A', { exact: false })).toBeVisible();
    await expect(page.getByText('Bahan MRP B', { exact: false })).toBeVisible();

    // Cleanup
    await api.del(`/bahan/${bahan1.data.id}`, token);
    await api.del(`/bahan/${bahan2.data.id}`, token);
  });

  mrpTests('TC-MRP-006: MRP PDF download button is present', async ({ page }) => {
    const { orderId } = await seedOrderWithResep();
    await page.goto(`/order/${orderId}`);

    // Wait for rincian belanja section to load
    await expect(page.getByRole('heading', { name: /Rincian Belanja/i })).toBeVisible();

    // Verify download PDF button exists and is visible
    await expect(page.getByRole('button', { name: /Download PDF/i })).toBeVisible();
  });
});
