import { test, expect } from '@playwright/test';
import { test as authTest, USERS, loginUser } from '../../fixtures/auth.fixture';
import { ApiClient } from '../../helpers/api-client';
import { OrderPage } from '../../page-objects/order.page';
import { OrderDetailPage } from '../../page-objects/order-detail.page';
import { uniquePelanggan } from '../../test-data/test-data';

const detailTests = authTest.extend<{ api: ApiClient }>({});

detailTests.describe('Order Detail (Black Box)', () => {
  let orderPage: OrderPage;
  let orderDetailPage: OrderDetailPage;
  let api: ApiClient;
  let token: string;

  detailTests.beforeEach(async ({ page, apiContext, authenticate }) => {
    await authenticate(page, USERS.admin);
    const { token: t } = await loginUser(USERS.admin);
    api = new ApiClient(apiContext).withToken(t);
    token = t;
    // Clean up all orders to avoid duplicate nomor_order conflicts.
    await api.cleanupOrders();
    orderPage = new OrderPage(page);
    orderDetailPage = new OrderDetailPage(page);
  });

  detailTests.afterEach(async () => {
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
        nama: 'Menu Detail Uji',
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
          alamat_pengiriman: 'Jl. Detail No. 1',
          jumlah_tamu: 20,
          items: [{ menu_id: menu.id, jumlah: 2 }],
        },
        token,
      ),
    );
    return { orderId: order.data.id, pelangganId: pelanggan.data.id };
  }

  detailTests('TC-ORDER-DETAIL-001: order detail displays info, items, and total', async ({ page }) => {
    const { orderId } = await seedOrder();
    await page.goto(`/order/${orderId}`);
    await orderDetailPage.expectLoaded();
    // Order info cards should render.
    await expect(page.getByRole('heading', { name: /Informasi Order/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Pembayaran/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Item Order/i })).toBeVisible();
  });

  detailTests('TC-ORDER-DETAIL-002: update order status via UI', async ({ page }) => {
    const { orderId } = await seedOrder();
    await page.goto(`/order/${orderId}`);
    await orderDetailPage.expectLoaded();
    await orderDetailPage.updateStatusViaModal('Selesai');
    await orderDetailPage.expectStatus('Selesai');
  });

  detailTests('TC-ORDER-DETAIL-003: pay DP updates payment status', async ({ page }) => {
    const { orderId } = await seedOrder();
    await page.goto(`/order/${orderId}`);
    await orderDetailPage.expectLoaded();
    await orderDetailPage.payDP('10000');
    await orderDetailPage.expectPayment(/DP Dibayar|Lunas/);
  });

  detailTests('TC-ORDER-DETAIL-004: pay full marks order as lunas', async ({ page }) => {
    const { orderId } = await seedOrder();
    await page.goto(`/order/${orderId}`);
    await orderDetailPage.expectLoaded();
    await orderDetailPage.payFull();
    await orderDetailPage.expectPayment(/Lunas|Sudah Lunas/);
  });

  detailTests('TC-ORDER-DETAIL-005: preview invoice opens in a new tab (public token)', async ({ page }) => {
    const { orderId } = await seedOrder();
    await page.goto(`/order/${orderId}`);
    await orderDetailPage.expectLoaded();
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      orderDetailPage.previewInvoiceButton.click(),
    ]);
    await popup.waitForLoadState();
    await expect(popup).toHaveURL(/\/invoice\//);
  });
});
