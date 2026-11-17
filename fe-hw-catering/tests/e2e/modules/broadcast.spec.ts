import { test, expect } from '@playwright/test';
import { test as authTest, USERS } from '../../fixtures/auth.fixture';

const broadcastTests = authTest;

broadcastTests.describe('Broadcast WhatsApp (Black Box)', () => {
  broadcastTests('TC-BROADCAST-001: admin can view the broadcast page', async ({ page, authenticate }) => {
    await authenticate(page, USERS.admin);
    await page.goto('/broadcast');
    await expect(page.getByRole('heading', { name: /Kirim Broadcast WhatsApp/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Tulis pesan broadcast/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Kirim|Send/i })).toBeVisible();
  });

  broadcastTests('TC-BROADCAST-002: empty message is blocked by client-side required validation', async ({ page, authenticate }) => {
    await authenticate(page, USERS.admin);
    await page.goto('/broadcast');
    await page.getByRole('button', { name: /Kirim|Send/i }).click();
    // The textarea is required; submission should be blocked and stay on the page.
    await expect(page).toHaveURL(/\/broadcast/);
  });

  broadcastTests('TC-BROADCAST-003: staff cannot access /broadcast (authorization boundary)', async ({ page, authenticate, staffUser }) => {
    await authenticate(page, staffUser);
    await page.goto('/broadcast');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
