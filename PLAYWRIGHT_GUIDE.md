# PLAYWRIGHT GUIDE — HW Katering Black Box Tests

Location: `fe-hw-catering/`
Test directory: `fe-hw-catering/tests/`
Configuration: `fe-hw-catering/playwright.config.ts`

---

## 1. Prerequisites

- **Node.js** 18+ (v24.22.1 used), **npm**
- **PHP** 8.2+ (8.5.12 used) and **Composer** (backend)
- **MySQL** 8+ running, database `hw_katering` migrated & seeded
- Backend API running on `http://127.0.0.1:8000`
- Frontend dev server running on `http://localhost:3000`

Browser note (important): this host is Ubuntu 26.04. Playwright's packaged Chromium/Firefox/WebKit are **not** available for this platform. Only the system **Google Chrome** works, driven via Playwright's `channel: 'chrome'`. Tests are configured for **Chromium only**; Firefox and WebKit are intentionally omitted.

---

## 2. Installation

Playwright is already declared in `fe-hw-catering/package.json` devDependencies:

```json
"devDependencies": {
  "playwright": "^1.52.0",
  "@playwright/test": "1.52.0"
}
```

Install dependencies (run once):

```bash
cd fe-hw-catering
npm install
```

No browser download is required/possible on this platform; the system Chrome is used via `channel: 'chrome'`.

**CORS**: `hw-catering/config/cors.php` explicitly allows `http://localhost:3000` and `http://127.0.0.1:3000` with credentials support. Laravel's `HandleCors` middleware is registered globally, so the frontend can reach the API whether the backend is served via `php artisan serve` or via the external Express proxy.

Environment variables (create `fe-hw-catering/.env` or export in shell):

```bash
export NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api   # backend origin used by API-assisted setup
export API_BASE_URL=http://127.0.0.1:8000               # used by the Playwright API client
export APP_BASE_URL=http://localhost:3000               # frontend origin
export HEADLESS=false                                    # set to run headed (debugging)
export CI=true                                           # CI mode (fewer retries, html reporter)
```

No secrets or production credentials are stored in the repository or test files. Test users are temporary accounts created through the real API.

---

## 3. Starting the Application

Both servers must be running. The Playwright config includes a `webServer` that starts them automatically (idempotent — it skips servers already listening):

```bash
cd fe-hw-catering
npx playwright test
```

The startup script `scripts/start-servers.sh`:
1. Starts `php artisan serve --port=8000` in `hw-catering/` if port 8000 is not answering.
2. Starts `npm run dev --port=3000` in `fe-hw-catering/` if port 3000 is not answering.
3. Waits for both to be ready before tests begin.

If you prefer to start them manually:

```bash
# Terminal 1 — backend
cd hw-catering && php artisan serve --port=8000

# Terminal 2 — frontend
cd fe-hw-catering && npm run dev --port=3000
```

Backend database (run once):

```bash
cd hw-catering
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=UserSeeder
```

---

## 4. Running Tests

From `fe-hw-catering/`:

```bash
# Full suite (Chromium)
npx playwright test

# Headed mode (useful for debugging)
HEADLESS=false npx playwright test

# CI mode (html reporter, 1 retry)
CI=true npx playwright test
```

### Run a single module / file

```bash
npx playwright test e2e/auth/login.spec.ts
npx playwright test e2e/modules/order.spec.ts
npx playwright test e2e/workflows/order-journey.spec.ts
```

### Run a single test by name

```bash
npx playwright test -g "TC-AUTH-001"
npx playwright test -g "TC-MENU-005"
```

### Run by directory

```bash
npx playwright test e2e/auth/
npx playwright test e2e/modules/
npx playwright test e2e/workflows/
```

---

## 5. Browser Selection

Only Chromium (system Chrome channel) is configured:

```ts
// playwright.config.ts
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
],
```

To add Firefox/WebKit on a host where Playwright can install them, add project entries:

```ts
{ name: 'firefox', use: devices['Desktop Firefox'] },
{ name: 'webkit',  use: devices['Desktop WebKit'] },
```

On this Ubuntu 26.04 host those browsers cannot be installed by Playwright, so they remain omitted (documented as a limitation in QA_ANALYSIS.md).

---

## 6. HTML Report Generation

After a run, the HTML report is available at:

```
fe-hw-catering/playwright-report/index.html
```

Generate and open it:

```bash
# Generate HTML report (run writes playwright-report/)
npx playwright test --reporter=html

# Open the report
npx playwright show-report
# or open directly:
open playwright-report/index.html   # macOS
xdg-open playwright-report/index.html  # Linux
```

The report includes pass/fail counts, traces, and screenshots captured on failure (`screenshot: 'only-on-failure'`, `trace: 'retain-on-failure'`).

---

## 7. Test Architecture

```
tests/
├── e2e/
│   ├── auth/              # login, logout, protected routes
│   ├── dashboard/         # summary widgets, data cards
│   ├── modules/           # menu, bahan, resep, pelanggan, order, order-detail, users, laporan, broadcast
│   └── workflows/         # order journey (create → status → payment)
├── fixtures/
│   └── auth.fixture.ts    # apiContext, loginUser, authenticate, staffUser
├── helpers/
│   └── api-client.ts      # real-API client for setup/assertions/cleanup
├── test-data/
│   └── test-data.ts       # centralized valid/invalid/boundary data + unique generators
├── page-objects/          # Page Object Model (BasePage + module pages)
└── README.md
```

Key design decisions:
- **API-assisted authentication**: `authenticate(page, user)` logs in via the real `POST /api/login` and injects the token into `localStorage` so the Next.js `AuthContext` hydrates. UI login flows are still tested directly (`e2e/auth/login.spec.ts`).
- **Page Object Model**: module pages encapsulate locators and actions; tests remain readable.
- **No fixed delays**: synchronization via Playwright auto-waiting and assertions; no `waitForTimeout()`.
- **Accessible selectors**: `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText` preferred. Modal labels are not bound via `for`/`id` in the app, so modal inputs are located by visible label-text traversal (`BasePage.fillByLabelText`) — also flagged as a front-end accessibility observation.
- **Independent tests**: each test gets a fresh browser context; created resources are cleaned up via the API after the test.
- **Real backend**: no stubs/mocks — the frontend talks to the real Laravel API.

---

## 8. Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| `Executable doesn't exist ... chromium_headless_shell` | Packaged Chromium unavailable on Ubuntu 26.04 | Use system Chrome via `channel: 'chrome'` (already configured). Do not run `playwright install chromium`. |
| `browserContext.newPage: ... ffmpeg-linux` | ffmpeg missing for video recording | Video is disabled (`video: off`). Screenshots/traces still work. |
| `Timed out ... toBeVisible` on modal input | Modal label not bound via `for`/`id`; `getByLabel` fails | Use `BasePage.fillByLabelText` / label-text traversal (already in page objects). |
| `getByRole('alert')` not found | Alert `<div>`s have no `role="alert"` | Alerts located by Tailwind classes `.bg-red-50...` / `.bg-green-50...` (in `base.page.ts`). |
| Staff login (`staff@katering.com`) fails | Seeded staff account anomaly (401/422 though password verifies) | Staff tests create a temporary staff user via the API (`staffUser` fixture). Documented as an observation in QA_ANALYSIS.md. |
| Tests hang / timeout | A test waits indefinitely (e.g. broadcast empty-message) | Run the specific file with a timeout; inspect `test-results/*/trace.zip`. |
| Port already in use | Another dev server on 3000/8000 | `start-servers.sh` reuses existing servers (`reuseExistingServer`). |

Logs: `/tmp/opencode/backend.log` and `/tmp/opencode/frontend.log` (written by `start-servers.sh`).
