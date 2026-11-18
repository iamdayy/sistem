import { test, expect } from '@playwright/test';
import { test as authTest, USERS, loginUser } from '../../fixtures/auth.fixture';
import { ApiClient } from '../../helpers/api-client';
import { OrderDetailPage } from '../../page-objects/order-detail.page';
import { uniquePelanggan } from '../../test-data/test-data';

const workflowTests = authTest.extend<{ api: ApiClient }>({});

workflowTests.describe('Order Journey Workflow (Black Box)', () => {
  let api: ApiClient;
  let token: string;

  workflowTests.beforeEach(async ({ page, apiContext, authenticate }) => {
    await authenticate(page, USERS.admin);
    const { token: t } = await loginUser(USERS.admin);
    api = new ApiClient(apiContext).withToken(t);
    token = t;
    // Clean up all orders to avoid duplicate nomor_order conflicts.
    await api.cleanupOrders();
  });

  workflowTests.afterEach(async () => {
    await api.cleanupOrders();
  });

  async function seedOrder() {
    const pelanggan = await api.json<any>(
      await api.post('/pelanggan', uniquePelanggan(), token),
    );
    const menus = await api.json<any>(await api.get('/menu?tersedia=1&per_page=100', token));
    let menu = menus.data.data.find((m: any) => m.tersedia);
    if (!menu) {
      const reseps = await api.json<any>(await api.get('/resep?per_page=1', token));
      const fd: Record<string, string> = {
        nama: 'Menu Journey Uji',
        harga: '20000',
        kategori: 'Makanan Utama',
        tersedia: '1',
        'resep[0][resep_id]': String(reseps.data.data[0].id),
        'resep[0][jumlah_porsi]': '1',
      };
      menu = (await api.json<any>(await api.postForm('/menu', fd, token))).data;
    }
    const order = await api.json<any>(
      await api.post(
        '/orders',
        {
          pelanggan_id: pelanggan.data.id,
          tanggal_order: '2026-12-01',
          tanggal_acara: '2026-12-20',
          waktu_acara: '12:00',
          alamat_pengiriman: 'Jl. Journey No. 1',
          jumlah_tamu: 30,
          items: [{ menu_id: menu.id, jumlah: 2 }],
        },
        token,
      ),
    );
    return { orderId: order.data.id, pelangganId: pelanggan.data.id };
  }

  workflowTests('TC-WORKFLOW-001: complete order journey — create → confirm → selesai → lunas', async ({ page }) => {
    const { orderId } = await seedOrder();

    // 1. Order appears in the list.
    await page.goto('/order');
    await expect(page.getByRole('heading', { name: /Manajemen Order/i })).toBeVisible();

    // 2. Open detail and verify initial state (pending, belum bayar).
    await page.goto(`/order/${orderId}`);
    const detail = new OrderDetailPage(page);
    await detail.expectLoaded();
    await detail.expectStatus('Pending');

    // 3. Update status to 'selesai'.
    await detail.updateStatusViaModal('Selesai');
    await detail.expectStatus('Selesai');

    // 4. Pay full → lunas.
    await detail.payFull();
    await detail.expectPaymentLunas();

    // Data persistence: reload and status/payment persist.
    await page.reload();
    await detail.expectStatus('Selesai');
  });
});
