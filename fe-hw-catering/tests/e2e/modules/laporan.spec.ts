import { test, expect } from '@playwright/test';
import { test as authTest, USERS } from '../../fixtures/auth.fixture';

const laporanTests = authTest;

laporanTests.describe('Laporan / Reports (Black Box)', () => {
  laporanTests('TC-LAPORAN-001: admin can view the laporan page with default date range', async ({ page, authenticate }) => {
    await authenticate(page, USERS.admin);
    await page.goto('/laporan');
    await expect(page.getByRole('heading', { name: /Laporan Order/i })).toBeVisible();
    // Date range inputs are present (no labels; locate by type).
    await expect(page.locator('input[type="date"]').first()).toBeVisible();
    await expect(page.locator('input[type="date"]').last()).toBeVisible();
  });

  laporanTests('TC-LAPORAN-002: laporan loads ringkasan data (total order, pendapatan)', async ({ page, authenticate }) => {
    await authenticate(page, USERS.admin);
    await page.goto('/laporan');
    await expect(page.getByText(/Total Order|Ringkasan/i, { exact: false })).toBeVisible();
  });

  laporanTests('TC-LAPORAN-003: staff can access laporan', async ({ page, authenticate, staffUser }) => {
    await authenticate(page, staffUser);
    await page.goto('/laporan');
    await expect(page.getByRole('heading', { name: /Laporan Order/i })).toBeVisible();
  });
});
