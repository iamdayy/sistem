import { test, expect } from '@playwright/test';
import { test as authTest, USERS, loginUser } from '../../fixtures/auth.fixture';
import { ApiClient } from '../../helpers/api-client';

const userTests = authTest.extend<{ api: ApiClient }>({});

userTests.describe('User Management (Black Box)', () => {
  let api: ApiClient;
  let token: string;

  userTests.beforeEach(async ({ page, apiContext, authenticate }) => {
    await authenticate(page, USERS.admin);
    const { token: t } = await loginUser(USERS.admin);
    api = new ApiClient(apiContext).withToken(t);
    token = t;
  });

  userTests('TC-USER-001: admin can view the user list', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: /Manajemen User|User/i })).toBeVisible();
  });

  userTests('TC-USER-002: admin can create a user via UI', async ({ page }) => {
    const email = `uji.${Date.now()}@example.com`;
    await page.goto('/users');
    await page.getByRole('button', { name: /Tambah User/i }).click();
    // Labels are not bound via `for`/`id`; use XPath parent traversal.
    await page.locator('xpath=//label[contains(., "Nama")]/..//input[1]').fill('User Uji');
    await page.locator('xpath=//label[contains(., "Email")]/..//input[1]').fill(email);
    await page.locator('xpath=//label[contains(., "Password")]/..//input[1]').fill('password123');
    await page.locator('xpath=//label[contains(., "Role")]/..//select[1]').selectOption({ label: 'Staff' });
    await page.getByRole('button', { name: /^Simpan|Update$/i }).click();
    await expect(page.getByText(email, { exact: false })).toBeVisible();
    // Cleanup via API.
    const list = await api.json<any>(await api.get('/users?per_page=100', token));
    const item = list.data.data.find((u: any) => u.email === email);
    if (item) await api.del(`/users/${item.id}`, token);
  });

  userTests('TC-USER-003: admin can edit a user via UI', async ({ page }) => {
    const email = `uji.${Date.now()}@example.com`;
    await api.post('/users', { name: 'User Uji', email, password: 'password123', role: 'staff' }, token);
    await page.goto('/users');
    await expect(page.getByText(email, { exact: false })).toBeVisible();
    await page.getByRole('button', { name: /^Edit$/i }).first().click();
    await page.locator('xpath=//label[contains(., "Nama")]/..//input[1]').fill('User Uji Diperbarui');
    await page.getByRole('button', { name: /^Simpan|Update$/i }).click();
    await expect(page.getByText('User Uji Diperbarui', { exact: false })).toBeVisible();
    const list = await api.json<any>(await api.get('/users?per_page=100', token));
    const item = list.data.data.find((u: any) => u.email === email);
    if (item) await api.del(`/users/${item.id}`, token);
  });

  userTests('TC-USER-004: admin can delete a user', async ({ page }) => {
    const email = `uji.${Date.now()}@example.com`;
    const created = await api.json<any>(
      await api.post('/users', { name: 'User Uji', email, password: 'password123', role: 'staff' }, token),
    );
    await page.goto('/users');
    await expect(page.getByText(email, { exact: false })).toBeVisible();
    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: /Hapus/i }).first().click();
    await expect(page.getByText(email, { exact: false })).not.toBeVisible();
  });

  userTests('TC-USER-005: staff cannot access /users (authorization boundary)', async ({ page, authenticate, staffUser }) => {
    await authenticate(page, staffUser);
    await page.goto('/users');
    // ProtectedRoute redirects non-admin users away from /users.
    // If redirected, we won't see the "Manajemen User" heading.
    await expect(page.getByRole('heading', { name: /Manajemen User|User/i })).not.toBeVisible();
  });
});
