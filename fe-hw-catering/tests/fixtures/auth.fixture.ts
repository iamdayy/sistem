import { test as base, expect as baseExpect } from '@playwright/test';
import type { Page, APIRequestContext } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';
import { createStaffUser } from '../test-data/test-data';

const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Test user accounts. These are seeded in the backend via UserSeeder and must
 * never be production credentials. Used only in the isolated test environment.
 */
export interface TestUser {
  email: string;
  password: string;
  role: 'admin' | 'staff';
  name?: string;
}

export const USERS: Record<string, TestUser> = {
  admin: {
    email: 'admin@katering.com',
    password: 'password',
    role: 'admin',
    name: 'Admin User',
  },
  staff: {
    email: 'staff@katering.com',
    password: 'password',
    role: 'staff',
    name: 'Staff User',
  },
};

/**
 * Custom test fixtures for HW Katering black box tests.
 *
 * - `apiContext`: a Playwright APIRequestContext pointed at the backend.
 * - `loginUser(user)`: authenticates via the backend API and returns
 *   { token, user }. Intended for API-assisted setup / assertions.
 * - `authenticate(page, user)`: logs in via the API and injects the token into
 *   localStorage so the Next.js AuthContext hydrates the protected app without
 *   typing through the login form. Returns { token, user }.
 */
/** Standalone login helper (usable without the fixture) for API-assisted setup. */
export async function loginUser(user: TestUser): Promise<{ token: string; user: any }> {
  const context = await base.request.newContext({
    baseURL: API_BASE,
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  });
  try {
    const response = await context.post('/api/login', {
      data: { email: user.email, password: user.password },
    });
    if (!response.ok()) {
      let detail = '';
      try {
        const body = await response.json();
        detail = body.message ?? JSON.stringify(body);
      } catch {
        detail = await response.text();
      }
      throw new Error(
        `Login failed for ${user.email}: HTTP ${response.status()} ${detail}`,
      );
    }
    const body = await response.json();
    return { token: body.data.token, user: body.data.user };
  } finally {
    await context.dispose();
  }
}

export type AuthFixtures = {
  apiContext: APIRequestContext;
  loginUser: (user: TestUser) => Promise<{ token: string; user: any }>;
  authenticate: (page: Page, user: TestUser) => Promise<{ token: string; user: any }>;
  /** Fresh staff user created via the API (seeded staff account is unreliable). */
  staffUser: TestUser;
};

export const test = base.extend<AuthFixtures>({
  apiContext: [async ({}, use) => {
    const context = await base.request.newContext({
      baseURL: API_BASE,
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });
    await use(context);
    await context.dispose();
  }, { scope: 'test' }],

  loginUser: [async ({ apiContext }, use) => {
    use(async (user: TestUser) => {
      const response = await apiContext.post('/api/login', {
        data: { email: user.email, password: user.password },
      });
      if (!response.ok()) {
        let detail = '';
        try {
          const body = await response.json();
          detail = body.message ?? JSON.stringify(body);
        } catch {
          detail = await response.text();
        }
        throw new Error(
          `Login failed for ${user.email}: HTTP ${response.status()} ${detail}`,
        );
      }
      return response.json();
    });
  }, { scope: 'test' }],

  authenticate: [async ({ apiContext }, use) => {
    use(async (page: Page, user: TestUser) => {
      // Log in via the real backend API.
      const response = await apiContext.post('/api/login', {
        data: { email: user.email, password: user.password },
      });
      if (!response.ok()) {
        throw new Error(
          `Authenticate failed for ${user.email}: HTTP ${response.status()}`,
        );
      }
      const body = await response.json();

      // Navigate to a same-origin page first so localStorage is accessible,
      // then inject the token so the Next.js AuthContext hydrates on the next
      // navigation to a protected page.
      await page.goto('/login');
      await page.evaluate(
        ({ token, user }) => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        },
        { token: body.data.token, user: body.data.user },
      );
      return { token: body.data.token, user: body.data.user };
    });
  }, { scope: 'test' }],

  staffUser: [async ({ apiContext }, use) => {
    const admin = await loginUser(USERS.admin);
    const api = new ApiClient(apiContext).withToken(admin.token);
    const staff = await createStaffUser(api);
    await use(staff);
    // Cleanup the temporary staff user.
    try {
      const list = await api.json<any>(await api.get('/users?per_page=100', admin.token));
      const item = list.data.data.find((u: any) => u.email === staff.email);
      if (item) await api.del(`/users/${item.id}`, admin.token);
    } catch {
      // ignore cleanup failures
    }
  }, { scope: 'test' }],
});

export const expect = baseExpect;
