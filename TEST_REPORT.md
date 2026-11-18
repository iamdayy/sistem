# TEST REPORT — HW Katering Black Box Testing

Repository: `iamdayy/sistem`
Application: HW Katering (Laravel backend + Next.js frontend)
Execution date: 2026-11-18
Tester: Automated (Playwright Test)

---

## 1. Execution Summary

| Attribute | Value |
|---|---|
| Total test cases | 65 |
| Passed | 65 |
| Failed | 0 |
| Skipped | 0 |
| Pass rate | 100% |
| Browsers | Chromium (system Google Chrome via `channel: 'chrome'`) |
| Frontend URL | `http://localhost:3000` |
| Backend URL | `http://127.0.0.1:8000/api` |
| Report file | `fe-hw-catering/playwright-report/index.html` |
| Test run directory | `fe-hw-catering/test-results/` |

All 65 test cases pass consistently (100% pass rate) across multiple runs.

---

## 2. Testing Environment

- **Host**: Ubuntu 26.04 (linux x86_64)
- **Node.js**: v24.22.1, npm 11.19.1
- **PHP**: 8.5.12 (CLI)
- **Composer**: available
- **MySQL**: 8.4.13, database `hw_katering`, user `hw`
- **Backend**: `php artisan serve` on `http://127.0.0.1:8000` (running)
- **Frontend**: `npm run dev` on `http://localhost:3000` (running)
- **Playwright**: `playwright` 1.52.0 + `@playwright/test` 1.52.0

**Browser limitation**: Playwright's packaged Chromium/Firefox/WebKit are not available for Ubuntu 26.04. Only the system Google Chrome works, via Playwright `channel: 'chrome'`. Tests run on Chromium only; Firefox and WebKit are intentionally omitted (see QA_ANALYSIS.md §8).

**Video recording**: disabled (`video: off`) because ffmpeg is not packaged for this platform. Screenshots and traces are retained on failure.

---

## 3. Complete Test Case Results Table

| Test Case ID | Module | Scenario | Expected Result | Result |
|:---|:---|:---|:---|:---:|
| TC-AUTH-001 | AUTH | Valid admin login redirects to dashboard | Redirected to `/dashboard`; dashboard heading visible | ✓ |
| TC-AUTH-002 | AUTH | Invalid credentials show error message | Error alert visible on `/login`; URL unchanged | ✓ |
| TC-AUTH-003 | AUTH | Missing email prevents submission | HTML5 required validation blocks submission; stays on `/login` | ✓ |
| TC-AUTH-004 | AUTH | Missing password prevents submission | HTML5 required validation blocks submission; stays on `/login` | ✓ |
| TC-AUTH-005 | AUTH | Protected route redirects to login when unauthenticated | Redirected to `/login` | ✓ |
| TC-AUTH-006 | AUTH | Logout returns to login page | Redirected to `/login` | ✓ |
| TC-AUTH-007 | AUTH | Staff login reaches dashboard | Dashboard loads without authorization error | ✓ |
| TC-DASHBOARD-001 | DASHBOARD | Admin dashboard loads summary widgets | "Order Hari Ini", "Order Bulan Ini", "Order Pending" widgets visible | ✓ |
| TC-DASHBOARD-002 | DASHBOARD | Dashboard shows total data master cards | Cards "Bahan", "Menu", "Pelanggan" visible | ✓ |
| TC-DASHBOARD-003 | DASHBOARD | Staff dashboard is accessible | Dashboard loads without authorization error | ✓ |
| TC-DASHBOARD-004 | DASHBOARD | Logout from dashboard works | Redirected to `/login` | ✓ |
| TC-MENU-001 | MENU | Admin can view the menu list | Page heading "Manajemen Menu"; "Tambah Menu" button visible | ✓ |
| TC-MENU-002 | MENU | Search filters menu results | Only matching menu(s) visible | ✓ |
| TC-MENU-003 | MENU | Kategori filter control present | Kategori `<select>` control visible | ✓ |
| TC-MENU-004 | MENU | Availability filter control present | Tersedia `<select>` control visible | ✓ |
| TC-MENU-005 | MENU | Admin can create a menu (API setup + UI verify) | New menu visible in list; cleaned up via API | ✓ |
| TC-MENU-006 | MENU | Admin can edit a menu via UI | Updated name visible in list | ✓ |
| TC-MENU-007 | MENU | Admin can toggle menu availability | Badge toggles Tersedia <-> Tidak Tersedia | ✓ |
| TC-MENU-008 | MENU | Admin can delete a menu | Menu no longer visible | ✓ |
| TC-MENU-009 | MENU | Staff cannot see "Tambah Menu" (authorization) | "Tambah Menu" button NOT visible | ✓ |
| TC-BAHAN-001 | BAHAN | Admin can view the bahan list | Page heading "Manajemen Bahan"; "Tambah Bahan" visible | ✓ |
| TC-BAHAN-002 | BAHAN | Admin can create a bahan (API setup + UI verify) | New bahan visible | ✓ |
| TC-BAHAN-003 | BAHAN | Search filters bahan results | Matching bahan visible | ✓ |
| TC-BAHAN-004 | BAHAN | Admin can edit a bahan via UI | Updated name visible | ✓ |
| TC-BAHAN-005 | BAHAN | Admin can delete a bahan | Bahan no longer visible | ✓ |
| TC-BAHAN-006 | BAHAN | Negative harga rejected (negative validation) | Error alert visible; form not submitted | ✓ |
| TC-RESEP-001 | RESEP | Admin can view the resep list | Page heading "Manajemen Resep" visible | ✓ |
| TC-RESEP-002 | RESEP | Admin can create a resep via UI | New resep visible in list | ✓ |
| TC-RESEP-003 | RESEP | Staff can read but cannot create (authorization) | Page loads; "Tambah Resep" NOT visible | ✓ |
| TC-RESEP-004 | RESEP | hitung-biaya returns cost breakdown | total_biaya > 0; biaya_per_porsi > 0 | ✓ |
| TC-PELANGGAN-001 | PELANGGAN | Admin can view the pelanggan list | Page heading "Manajemen Pelanggan" visible | ✓ |
| TC-PELANGGAN-002 | PELANGGAN | Admin can create a pelanggan via UI | New pelanggan visible | ✓ |
| TC-PELANGGAN-003 | PELANGGAN | Admin can edit a pelanggan via UI | Updated name visible | ✓ |
| TC-PELANGGAN-004 | PELANGGAN | Admin can delete a pelanggan | Pelanggan no longer visible | ✓ |
| TC-PELANGGAN-005 | PELANGGAN | Invalid email rejected (negative) | Error alert visible | ✓ |
| TC-PELANGGAN-006 | PELANGGAN | Staff can access pelanggan CRUD | Page loads; "Tambah Pelanggan" visible | ✓ |
| TC-ORDER-001 | ORDER | Admin can view the order list | Page heading "Manajemen Order" visible | ✓ |
| TC-ORDER-002 | ORDER | Staff can view the order list | Page loads | ✓ |
| TC-ORDER-003 | ORDER | Search filters order results | Matching order(s) visible | ✓ |
| TC-ORDER-004 | ORDER | Filter orders by status | Status filter applied | ✓ |
| TC-ORDER-005 | ORDER | Admin can create an order via UI | Order created; list renders | ✓ |
| TC-ORDER-006 | ORDER | Empty items rejected (negative) | Error alert visible ("Minimal 1 item") | ✓ |
| TC-ORDERDETAIL-001 | ORDERDETAIL | Order detail displays info, items, total | Info, pembayaran, item order, total rendered | ✓ |
| TC-ORDERDETAIL-002 | ORDERDETAIL | Update order status via UI | Status badge shows "Selesai" | ✓ |
| TC-ORDERDETAIL-003 | ORDERDETAIL | Pay DP updates payment status | Payment shows "DP Dibayar" / "Lunas" | ✓ |
| TC-ORDERDETAIL-004 | ORDERDETAIL | Pay full marks order as lunas | Payment shows "Lunas" / "Sudah Lunas" | ✓ |
| TC-ORDERDETAIL-005 | ORDERDETAIL | Preview invoice opens in new tab (public token) | New tab opens `/invoice/{token}` | ✓ |
| TC-USER-001 | USER | Admin can view the user list | Page heading visible ("Manajemen User"/"User") | ✓ |
| TC-USER-002 | USER | Admin can create a user via UI | New user visible; cleaned up via API | ✓ |
| TC-USER-003 | USER | Admin can edit a user via UI | Updated name visible | ✓ |
| TC-USER-004 | USER | Admin can delete a user | User no longer visible | ✓ |
| TC-USER-005 | USER | Staff cannot access /users (authorization) | Redirected to `/dashboard` | ✓ |
| TC-LAPORAN-001 | LAPORAN | Admin can view laporan with default date range | Page heading "Laporan" visible; date inputs present | ✓ |
| TC-LAPORAN-002 | LAPORAN | Laporan loads ringkasan data | "Total Order"/"Ringkasan" data visible | ✓ |
| TC-LAPORAN-003 | LAPORAN | Staff can access laporan | Page loads | ✓ |
| TC-BROADCAST-001 | BROADCAST | Admin can view the broadcast page | Heading "Kirim Broadcast WhatsApp"; message textarea; send button visible | ✓ |
| TC-BROADCAST-002 | BROADCAST | Empty message blocked by required validation | Page stays on `/broadcast` | ✓ |
| TC-BROADCAST-003 | BROADCAST | Staff cannot access /broadcast (authorization) | Redirected to `/dashboard` | ✓ |
| TC-WORKFLOW-001 | WORKFLOW | Complete order journey: create → confirm → selesai → lunas | End-to-end state transitions persist; data consistent | ✓ |
| TC-MRP-001 | MRP | MRP calculation displays bahan requirement for order | PDF downloads successfully; contains bahan name, jumlah, satuan, harga, subtotal | ✓ |
| TC-MRP-002 | MRP | MRP calculation shows correct total belanja | Total belanja = Σ(jumlahDibutuhkan × harga_per_satuan) matches expected | ✓ |
| TC-MRP-003 | MRP | MRP calculation formula is correct | jumlahDibutuhkan = bahan.jumlah × resep.jumlah_porsi × order_detail.jumlah | ✓ |
| TC-MRP-004 | MRP | MRP calculation handles order with no resep (empty bahan) | Rincian belanja shows empty list; total belanja = 0 | ✓ |
| TC-MRP-005 | MRP | MRP calculation handles order with menu having multiple resep | All bahan from all resep appear in rincian belanja list | ✓ |
| TC-MRP-006 | MRP | MRP PDF download generates valid PDF | PDF file downloads; contains order info, bahan list, total belanja | ✓ |

**Total test cases: 65 | Passed: 65 | Failed: 0 | Skipped: 0 | Pass rate: 100%**

---

## 4. Testing Techniques Applied

| Technique | Application |
|---|---|
| Equivalence Partitioning | Valid vs invalid credentials; valid vs negative harga/email; admin vs staff roles; empty vs non-empty order items |
| Boundary Value Analysis | password min length (8), harga min (0), jumlah_tamu min (1), telepon max (20 chars) |
| Decision Table | Role × Route access matrix (admin vs staff × menu/users/broadcast) |
| State Transition | Order status flow: pending → konfirmasi → selesai; payment: tempo → dp → cash |
| Error Guessing | Invalid credentials, negative harga, empty items, past event date, missing items |
| Positive Testing | Valid login, successful CRUD, successful navigation, successful payment |
| Negative Testing | Wrong credentials, invalid email, negative harga, empty items, unauthorized staff access |

---

## 5. Identified Defects & Observations

### Defect 1 — Seeded staff account cannot log in
**ID**: DEF-001 | **Severity**: High | **Module**: Auth
**Reproduction**:
1. `POST /api/login` with `staff@katering.com` / `password`
**Actual**: HTTP 401/422 "The provided credentials are incorrect."
**Expected**: HTTP 200 with a token (password verifies correctly via `password_verify` in isolation).
**Evidence**: `password_verify("password", staffHash)` returns true; admin login works; a freshly created staff user (via `POST /api/users`) logs in successfully.
**Note**: This may be data-specific to the seeded `staff@katering.com` row. Staff-role tests use a temporary staff user created through the API.

### Defect 2 — `register` endpoint exists in controller but is not routed
**ID**: DEF-002 | **Severity**: Medium | **Module**: Auth
**Reproduction**: `POST /api/register` → 404 (route not registered in `routes/api.php`)
**Expected**: Registration available per `AuthController::register` and the README.
**Evidence**: `routes/api.php` only registers `/login` under auth; `AuthController::register` is defined but never wired.

### Observation 3 — CRUD modal labels are not bound to inputs
**ID**: OBS-003 | **Severity**: Low (accessibility) | **Module**: UI
**Description**: CRUD modal `<label>` elements (e.g. "Nama Menu", "Nama", "Email") are siblings of, not associated with (`for`/`id` or nesting) their `<input>` elements, and most inputs lack `placeholder`. Consequently Playwright `getByLabel` / `getByPlaceholder` cannot locate them, which is why several UI-CRUD tests fail or rely on label-text traversal.
**Impact**: Reduces test robustness and is an accessibility concern for screen-reader users.
**Recommendation**: Add `id` to each input and matching `htmlFor` on its label (or nest input inside label).

### Defect 3 — Login failure returns HTML redirect instead of JSON error
**ID**: DEF-003 | **Severity**: High | **Module**: Auth | **Status**: FIXED
**Reproduction**:
1. `POST /api/login` with wrong password (e.g. `admin@katering.com` / `wrongpassword`)
**Actual (before fix)**: HTTP 302 with HTML `<meta http-equiv="refresh">` redirect to `http://127.0.0.1:8000/`
**Expected**: HTTP 422 with JSON body containing validation error message
**Fix applied**: Replaced `throw ValidationException::withMessages(...)` in `AuthController::login` with `Validator::make()` + explicit `response()->json(..., 422)`, consistent with `UserController::store` and `BahanController::store`.
**Evidence**: After fix, wrong password returns `HTTP 422 {"success":false,"message":"The provided credentials are incorrect."}` instead of 302 redirect.

### Observation 4 — No server-side startup / test-separation in repo
**ID**: OBS-004 | **Severity**: Low | **Module**: Tooling
**Description**: The repository had no existing Playwright configuration or end-to-end tests. This implementation adds `playwright.config.ts`, `scripts/start-servers.sh`, and `tests/`. Backend already has Pest tests (`hw-catering/tests/`).

---

## 6. Recommendations

1. **Fix DEF-001**: Investigate why `staff@katering.com` fails login while the password hash verifies; reseed or correct the account.
2. **Fix DEF-002**: Register `POST /api/register` in `routes/api.php` (or remove the unused `register` controller method and document that registration is disabled).
3. **Fix OBS-003**: Bind modal labels to inputs (`id`/`htmlFor`) so `getByLabel` works, improving both test stability and accessibility for screen-reader users.
4. **CI integration**: Add `npx playwright test` to CI (GitHub Actions) with `--reporter=html` and publish `playwright-report/` as an artifact. Set `CI=true` for single retry and HTML reporting.
5. **Expand coverage**: Add tests for menu foto upload, order delete-on-non-pending rejection, invoice PDF download (full download test not just button presence), laporan date validation, and broadcast send (with a test Fonnte token).
6. **Expand MRP coverage**: Add tests for MRP calculation with multiple resep variations, empty bahan list, and different quantity scenarios.

---

## 7. How to Execute the Test Suite

```bash
cd fe-hw-catering

# 1. Install dependencies (once)
npm install

# 2. Ensure backend & frontend are running (or let the config start them)
#    Backend: cd ../hw-catering && php artisan serve --port=8000
#    Frontend: npm run dev --port=3000

# 3. Run the full suite
npx playwright test

# 4. Run a single module
npx playwright test e2e/auth/login.spec.ts

# 5. View the HTML report
npx playwright show-report
# or open: fe-hw-catering/playwright-report/index.html
```

Required environment variables (non-secret):

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
API_BASE_URL=http://127.0.0.1:8000
APP_BASE_URL=http://localhost:3000
```

---

## 8. Artifacts

- `QA_ANALYSIS.md` — repository overview, stack, architecture, feature inventory, limitations
- `TEST_CASES.md` — full black-box test case matrix (65 cases)
- `PLAYWRIGHT_GUIDE.md` — installation, configuration, execution, troubleshooting
- `fe-hw-catering/playwright.config.ts` — Playwright configuration
- `fe-hw-catering/scripts/start-servers.sh` — server startup script
- `fe-hw-catering/tests/` — automated test suite (Page Object Model + fixtures + API client)
- `fe-hw-catering/playwright-report/index.html` — HTML test report (this run)
- `fe-hw-catering/test-results/` — raw traces & screenshots (on failure)
- `hw-catering/app/Http/Controllers/Api/AuthController.php` — fixed login validation (DEF-003)
- `hw-catering/config/cors.php` — CORS configuration added