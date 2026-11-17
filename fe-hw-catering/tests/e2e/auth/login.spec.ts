import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/login.page';
import { LayoutPage } from '../../page-objects/layout.page';

test.describe('Authentication (Black Box)', () => {
  let loginPage: LoginPage;
  let layoutPage: LayoutPage;

  test.beforeEach(({ page }) => {
    loginPage = new LoginPage(page);
    layoutPage = new LayoutPage(page);
  });

  test('TC-AUTH-001: valid admin login redirects to dashboard', async ({ page }) => {
    await loginPage.goto();
    await loginPage.expectLoaded();
    await loginPage.login('admin@katering.com', 'password');
    await expect(page).toHaveURL(/\/dashboard/);
    await layoutPage.expectModuleLink('Dashboard');
  });

  test('TC-AUTH-002: invalid credentials show an error message', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login('admin@katering.com', 'salah123');
    await loginPage.expectError('credentials');
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-AUTH-003: missing email prevents submission (stays on login)', async ({ page }) => {
    await loginPage.goto();
    await loginPage.emailInput.fill('');
    await loginPage.passwordInput.fill('password');
    await loginPage.submitEmpty();
    // HTML5 required validation blocks submission; URL unchanged.
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-AUTH-004: missing password prevents submission (stays on login)', async ({ page }) => {
    await loginPage.goto();
    await loginPage.emailInput.fill('admin@katering.com');
    await loginPage.passwordInput.fill('');
    await loginPage.submitEmpty();
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-AUTH-005: protected dashboard redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-AUTH-006: logout returns to login page', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login('admin@katering.com', 'password');
    await expect(page).toHaveURL(/\/dashboard/);
    await layoutPage.logout();
    await layoutPage.expectOnLogin();
  });

  test('TC-AUTH-007: staff login reaches dashboard', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login('staff@katering.com', 'password');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
