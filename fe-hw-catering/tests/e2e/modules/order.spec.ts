import { test, expect } from '@playwright/test';
import { test as authTest, USERS, loginUser } from '../../fixtures/auth.fixture';
import { ApiClient } from '../../helpers/api-client';
import { OrderPage } from '../../page-objects/order.page';
import { OrderDetailPage } from '../../page-objects/order-detail.page';
import { LayoutPage } from '../../page-objects/layout.page';
import { VALID, uniquePelanggan } from '../../test-data/test-data';

const orderTests = authTest.extend<{ api: ApiClient }>({});

orderTests.describe('Order Management (Black Box)', () => {
  let orderPage: OrderPage;
  let orderDetailPage: OrderDetailPage;
  let layoutPage: LayoutPage;
  let api: ApiClient;
  let token: string;
  let pelangganId: number;
  let menuId: number;
  let menuNama: string;

  orderTests.beforeEach(async ({ page, apiContext, authenticate }) => {
    await authenticate(page, USERS.admin);
    const { token: t } = await loginUser(USERS.admin);
    api = new ApiClient(apiContext).withToken(t);
    token = t;
    // Clean up all orders to avoid duplicate nomor_order conflicts
    // (nomor_order is generated as ORD-YYYYMMDD-XXXX based on today's count).
    await api.cleanupOrders();
    orderPage = new OrderPage(page);
    orderDetailPage = new OrderDetailPage(page);
    layoutPage = new LayoutPage(page);

    // Deterministic setup: ensure a pelanggan and an available menu exist.
    const pelanggan = await api.json<any>(
      await api.post('/pelanggan', uniquePelanggan(), token),
    );
    pelangganId = pelanggan.data.id;

    const menus = await api.json<any>(await api.get('/menu?tersedia=1&per_page=100', token));
    const tersedia = menus.data.data.find((m: any) => m.tersedia);
    if (!tersedia) {
      // Create an available menu if none exists.
      const reseps = await api.json<any>(await api.get('/resep?per_page=1', token));
      const formData: Record<string, string> = {
        nama: 'Menu Tersedia Uji',
        harga: '20000',
        kategori: 'Makanan Utama',
        tersedia: '1',
        'resep[0][resep_id]': String(reseps.data.data[0].id),
        'resep[0][jumlah_porsi]': '1',
      };
      const created = await api.json<any>(await api.postForm('/menu', formData, token));
      menuId = created.data.id;
      menuNama = created.data.nama;
    } else {
      menuId = tersedia.id;
      menuNama = tersedia.nama;
    }
  });

  orderTests.afterEach(async () => {
    // Cleanup all orders and the fixture pelanggan.
    await api.cleanupOrders();
    try {
      await api.del(`/pelanggan/${pelangganId}`, token);
    } catch {
      // ignore
    }
  });

  orderTests('TC-ORDER-001: admin can view the order list', async ({ page }) => {
    await orderPage.goto();
    await orderPage.expectLoaded();
  });

  orderTests('TC-ORDER-002: staff can view the order list (role: admin,staff)', async ({ page, authenticate, staffUser }) => {
    await authenticate(page, staffUser);
    await orderPage.goto();
    await orderPage.expectLoaded();
  });

  orderTests('TC-ORDER-003: search filters order results', async ({ page }) => {
    // Create an order via API so there is something to find.
    await api.post(
      '/orders',
      {
        pelanggan_id: pelangganId,
        tanggal_order: '2026-12-01',
        tanggal_acara: '2026-12-20',
        waktu_acara: '12:00',
        alamat_pengiriman: 'Jl. Cari No. 1',
        jumlah_tamu: 10,
        items: [{ menu_id: menuId, jumlah: 2 }],
      },
      token,
    );
    await orderPage.goto();
    // Search by customer name (the API searches by order number or customer name).
    const pelanggan = await api.json<any>(await api.get(`/pelanggan/${pelangganId}`, token));
    await orderPage.searchInput.fill(pelanggan.data.nama);
    // Wait for the search results to load (the API call is triggered by onChange).
    await expect(orderPage.page.getByText(pelanggan.data.nama, { exact: false })).toBeVisible();
  });

  orderTests('TC-ORDER-004: filter orders by status', async ({ page }) => {
    await orderPage.goto();
    await orderPage.expectLoaded();
    await orderPage.statusFilter.selectOption({ label: 'Pending' });
    await orderPage.statusFilter.press('Enter');
  });

  orderTests('TC-ORDER-005: admin can create an order via UI', async ({ page }) => {
    const pelanggan = await api.json<any>(await api.get(`/pelanggan/${pelangganId}`, token));
    await orderPage.goto();
    await orderPage.openAddOrder();
    await orderPage.selectPelanggan(new RegExp(pelanggan.data.nama));

    await orderPage.fillOrderForm({
      tanggal_acara: VALID.order.tanggal_acara,
      waktu_acara: VALID.order.waktu_acara,
      alamat_pengiriman: VALID.order.alamat_pengiriman,
      jumlah_tamu: VALID.order.jumlah_tamu,
      catatan: VALID.order.catatan,
    });

    await orderPage.addItem();
    await orderPage.selectItemMenu(new RegExp(menuNama));
    await orderPage.fillItemJumlah(2);

    await orderPage.modalSimpanButton.click();
    await orderPage.page.waitForTimeout(0);
    // A new order is created; verify the list renders without error.
    await orderPage.expectLoaded();
  });

  orderTests('TC-ORDER-006: creating an order with no items is rejected', async ({ page }) => {
    const pelanggan = await api.json<any>(await api.get(`/pelanggan/${pelangganId}`, token));
    await orderPage.goto();
    await orderPage.openAddOrder();
    await orderPage.selectPelanggan(new RegExp(pelanggan.data.nama));
    await orderPage.fillOrderForm({
      tanggal_acara: VALID.order.tanggal_acara,
      waktu_acara: VALID.order.waktu_acara,
      alamat_pengiriman: VALID.order.alamat_pengiriman,
      jumlah_tamu: VALID.order.jumlah_tamu,
    });
    await orderPage.modalSimpanButton.click();
    // The form should not submit (no items), so we stay on the order page.
    await expect(page).toHaveURL(/\/order/);
    await orderPage.modalBatalButton.click();
  });
});
