import { test, expect } from '@playwright/test';
import { test as authTest, USERS } from '../../fixtures/auth.fixture';
import { DashboardPage } from '../../page-objects/dashboard.page';
import { LayoutPage } from '../../page-objects/layout.page';

// Dashboard is reachable by both admin and staff.
const dashboardTests = authTest;

dashboardTests.describe('Dashboard (Black Box)', () => {
  let dashboardPage: DashboardPage;
  let layoutPage: LayoutPage;

  dashboardTests.beforeEach(async ({ page, authenticate, staffUser }, testInfo) => {
    const user = testInfo.title.includes('staff') ? staffUser : USERS.admin;
    await authenticate(page, user);
    dashboardPage = new DashboardPage(page);
    layoutPage = new LayoutPage(page);
  });

  dashboardTests('TC-DASHBOARD-001: admin dashboard loads summary widgets', async ({ page }) => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();
    await dashboardPage.expectSummaryVisible();
  });

  dashboardTests('TC-DASHBOARD-002: dashboard shows total data master cards', async ({ page }) => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();
    await dashboardPage.expectTotalDataCard('Bahan');
    await dashboardPage.expectTotalDataCard('Menu');
    await dashboardPage.expectTotalDataCard('Pelanggan');
  });

  dashboardTests('TC-DASHBOARD-003: staff dashboard is accessible', async ({ page }) => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();
    await dashboardPage.expectSummaryVisible();
  });

  dashboardTests('TC-DASHBOARD-004: logout from dashboard works', async ({ page }) => {
    await dashboardPage.goto();
    await layoutPage.logout();
    await layoutPage.expectOnLogin();
  });
});
