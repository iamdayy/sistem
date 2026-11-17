# HW Katering — Playwright Black Box Test Suite

This directory contains the automated Black Box Test suite for the HW Katering
frontend (Next.js) against the real Laravel backend API.

## Structure

```
tests/
├── e2e/
│   ├── auth/              # Authentication (login, logout, protected routes)
│   ├── dashboard/         # Dashboard statistics & widgets
│   ├── modules/           # Per-module CRUD: menu, bahan, resep, pelanggan, order, order-detail, users, laporan, broadcast
│   └── workflows/         # Multi-step user journeys (order lifecycle)
├── fixtures/              # Playwright fixtures (auth, API context, test users)
├── helpers/               # API client helper for API-assisted setup/assertions
├── test-data/             # Centralized deterministic test data
├── page-objects/          # Page Object Model classes
└── README.md              # this file
```

## How tests authenticate

The frontend `AuthContext` hydrates from `localStorage` (`token` + `user`) and
validates against `GET /api/me`. To avoid typing through the login form on
every protected test, the `authenticate(page, user)` fixture logs in via the
real backend API (`POST /api/login`) and injects the token into `localStorage`.
This is **API-assisted setup**, not a mock — the browser still talks to the
real backend.

UI login flows are still tested directly in `tests/e2e/auth/login.spec.ts`.

## Test data

Test users are the accounts seeded by `UserSeeder` (`admin@katering.com`,
`staff@katering.com`, password `password`). These exist only in the isolated
test environment and are never production credentials.

Created resources (menus, bahan, pelanggan, orders, users) are cleaned up via
the backend API after each test so the suite is repeatable.

## Running

See `PLAYWRIGHT_GUIDE.md` for installation, configuration, environment
variables, and execution commands.

## Browser coverage

Only Chromium (driven via the system Google Chrome `channel`) is available on
this Ubuntu 26.04 host; Firefox and WebKit are not packaged for this platform
and are intentionally omitted. See `PLAYWRIGHT_GUIDE.md`.
