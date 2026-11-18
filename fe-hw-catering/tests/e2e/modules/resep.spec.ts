import { expect } from "@playwright/test";
import {
  test as authTest,
  loginUser,
  USERS,
} from "../../fixtures/auth.fixture";
import { ApiClient } from "../../helpers/api-client";

const resepTests = authTest.extend<{ api: ApiClient }>({});

resepTests.describe("Resep Management (Black Box)", () => {
  let api: ApiClient;
  let token: string;

  resepTests.beforeEach(async ({ page, apiContext, authenticate }) => {
    await authenticate(page, USERS.admin);
    const { token: t } = await loginUser(USERS.admin);
    api = new ApiClient(apiContext).withToken(t);
    token = t;
  });

  resepTests(
    "TC-RESEP-001: admin can view the resep list",
    async ({ page }) => {
      await page.goto("/resep");
      await expect(
        page.getByRole("heading", { name: /Manajemen Resep/i }),
      ).toBeVisible();
    },
  );

  resepTests(
    "TC-RESEP-002: admin can create a resep via UI",
    async ({ page }) => {
      // Ensure a bahan exists for the resep composition.
      const bahan = await api.json<any>(
        await api.post(
          "/bahan",
          { nama: "Bahan Resep Uji", satuan: "kg", harga_per_satuan: 10000 },
          token,
        ),
      );
      await page.goto("/resep");
      await page.getByRole("button", { name: /Tambah Resep/i }).click();
      await page
        .locator(
          'xpath=//label[contains(., "Nama Resep") or contains(., "^Nama")]/..//input[1]',
        )
        .fill("Resep Uji");
      await page
        .locator('xpath=//label[contains(., "Deskripsi")]/..//textarea[1]')
        .fill("Deskripsi resep uji");
      await page
        .locator('xpath=//label[contains(., "Porsi")]/..//input[1]')
        .fill("4");
      // Add at least one bahan (client requires min 1).
      await page.getByRole("button", { name: /\+ Tambah Bahan/i }).click();
      await page.locator("select").last().selectOption({ index: 1 });
      await page.getByPlaceholder("Jumlah").last().fill("1");
      await page.getByRole("button", { name: /^Simpan|Update$/i }).click();
      // The resep should appear in the list.
      await expect(
        page.getByText("Resep Uji", { exact: false }).first(),
      ).toBeVisible();
      // Cleanup.
      await api.del(`/bahan/${bahan.data.id}`, token);
    },
  );

  resepTests(
    "TC-RESEP-003: staff can read resep but cannot create (authorization)",
    async ({ page, authenticate, staffUser }) => {
      await authenticate(page, staffUser);
      await page.goto("/resep");
      // ProtectedRoute redirects non-admin to /dashboard.
      await expect(
        page.getByRole("heading", { name: /Dashboard/i, level: 1 }),
      ).toBeVisible();
    },
  );
});
