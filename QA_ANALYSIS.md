# QA ANALYSIS — HW Katering (sistem)

Repository: `iamdayy/sistem` (local working copy: `/home/iamdayy/Documents/SKRIPSI/Ayangkuuuu/sistem`)

Date: 2026-11-18

---

## 1. Repository Overview

The repository contains a complete catering management system split into two applications:

| Directory | Purpose | Role |
|---|---|---|
| `hw-catering/` | Backend API | Laravel 12 (PHP 8.2+), Laravel Sanctum, MySQL |
| `fe-hw-catering/` | Frontend UI | Next.js 16.1.4 (Pages Router), React 19, TailwindCSS 4 |

There is no `AGENTS.md` or `CLAUDE.md` in the repository root. The `.github/instructions/codacy.instructions.md` file is ignored via `.gitignore` and contains no project-specific test guidance.

The two applications communicate exclusively over HTTP (REST JSON). The frontend calls the backend API; there is no shared code, no SSR data fetching from the backend directly, and no database access from the frontend.

---

## 2. Technology Stack

### Backend (`hw-catering/`)
- **Framework**: Laravel 12 (`laravel/framework: ^12.0`)
- **Language**: PHP 8.5.12 (runtime); `composer.json` requires `^8.2`
- **Authentication**: Laravel Sanctum (token-based, `personal_access_tokens`)
- **Database**: MySQL 8.4.13 (`DB_CONNECTION=mysql`), database `hw_katering`
- **API routes**: `routes/api.php` (base `/api`); `routes/web.php` only serves a welcome view
- **Validation**: Laravel `Validator` / `$request->validate()`
- **PDF generation**: `barryvdh/laravel-dompdf` (invoices & rincian belanja)
- **External SMS**: `App\Services\FonnteService` (WhatsApp broadcast) — requires `FONNTE_TOKEN`
- **Test framework (backend)**: Pest (`pestphp/pest`) — existing `tests/Feature` & `tests/Unit`
- **Seeder**: `UserSeeder` creates `admin@katering.com` and `staff@katering.com` (password `password`)

### Frontend (`fe-hw-catering/`)
- **Framework**: Next.js 16.1.4 (Pages Router)
- **Language**: TypeScript & JavaScript (`tsconfig.json`, `jsconfig.json`)
- **UI Library**: React 19.2.3
- **Styling**: TailwindCSS 4
- **State Management**: React Context API (`src/contexts/AuthContext.tsx`)
- **Routing**: Next.js `next/router` + `next/navigation` (`useRouter`)
- **API layer**: `src/lib/api/*.ts` (fetch-based clients per module)
- **Build/lint**: ESLint (`eslint-config-next`)
- **Playwright**: `playwright: ^1.52.0` + `@playwright/test: 1.52.0` (devDependencies)

### Integration
- Frontend `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api` (`.env.local`)
- Frontend `NEXT_PUBLIC_STORAGE_URL=http://127.0.0.1:8000/storage/`
- Backend `APP_URL=http://localhost`; `SESSION_DRIVER=database`
- Auth token stored in `localStorage` (`token`, `user`); `AuthContext` validates via `GET /api/me` on mount
- Protected routes via `ProtectedRoute` (redirects unauthenticated to `/login`; non-admin to `/dashboard`)
- CORS: Laravel's `HandleCors` middleware is registered globally. `config/cors.php` explicitly allows `http://localhost:3000` and `http://127.0.0.1:3000` with credentials support. Previously CORS relied on an external Express proxy (`node server.js` on port 8000) not part of the repository; the new config ensures CORS works when the backend is served via `php artisan serve` directly.

---

## 3. Backend Architecture

**Route groups (`routes/api.php`):**
- `POST /api/login` (public)
- Sanctum-protected (`auth:sanctum`): `logout`, `me`, dashboard, users, bahan, resep, menu, pelanggan, orders, broadcast
- Role middleware (`RoleMiddleware`): `role:admin`, `role:staff`, `role:admin,staff`

**Controllers (`app/Http/Controllers/Api/`):**
- `AuthController` — login/logout/me (register exists in controller but is NOT routed in `api.php`)
- `DashboardController` — index/summary/charts
- `UserController` — CRUD users (admin only)
- `BahanController` — CRUD ingredients (admin only)
- `ResepController` — CRUD recipes; `hitung-biaya` (read: admin+staff; write: admin)
- `MenuController` — CRUD menus, `toggle-availability`, `by-kategori` (read: all; write: admin)
- `PelangganController` — CRUD customers (admin+staff)
- `OrderController` — CRUD orders, status update, payments (DP/full), invoice PDF, reports
- `BroadcastController` — WhatsApp broadcast via Fonnte (admin only)

**Models (`app/Models/`):** `User`, `Bahan`, `Resep`, `Menu`, `Pelanggan`, `Order`, `OrderDetail`. Relationships: order belongs to pelanggan, has many order details; order detail belongs to menu; menu has many resep (pivot `menu_resep`); resep has many bahan (pivot `resep_bahan`).

**Order statuses:** `pending`, `dikonfirmasi`, `diproses`, `dikirim`, `selesai`, `dibatalkan`.
**Payment types:** `tempo` (unpaid), `dp` (partial), `cash` (paid in full).

---

## 4. Frontend Architecture

Pages (`src/pages/`), all under `Layout` + `Sidebar`:
- `/` — Landing page (public; fetches menus, falls back to mock data)
- `/login` — Login form (email/password)
- `/dashboard` — Statistics widgets, charts, top menu/customers
- `/menu` — Menu CRUD + search + kategori/tersedia filters (admin write)
- `/bahan` — Ingredient CRUD + search (admin only, `requireAdmin`)
- `/resep` — Recipe CRUD + hitung-biaya (admin write / staff read)
- `/pelanggan` — Customer CRUD + search + pagination (admin+staff)
- `/order` — Order CRUD, search, status filter, add order with items (admin+staff)
- `/order/[id]` — Order detail: info, payment (DP/full), status, invoice preview/download, rincian belanja
- `/laporan` — Order reports with date range (admin+staff)
- `/users` — User CRUD (admin only)
- `/broadcast` — WhatsApp broadcast (admin only)

`Layout` renders the sidebar navigation and a Logout button. `ProtectedRoute` guards all internal pages.

---

## 5. Feature Inventory

| Module | Feature | URL | Roles | Notes |
|---|---|---|---|---|
| Auth | Login / Logout | `/login`, Layout | all | Token in localStorage |
| Auth | Protected routes | `ProtectedRoute` | all | Redirect to `/login` |
| Dashboard | Statistics & widgets | `/dashboard` | admin, staff | Summary cards, charts |
| Menu | CRUD + search + filters | `/menu` | all read; admin write | foto upload, resep pivot |
| Bahan | CRUD + search | `/bahan` | admin only | satuan, harga/satuan |
| Resep | CRUD + hitung-biaya | `/resep` | read: admin+staff; write: admin | bahan composition |
| Pelanggan | CRUD + search + pagination | `/pelanggan` | admin, staff | unique email |
| Order | CRUD, status, payments | `/order`, `/order/[id]` | admin, staff | DP/full, invoice PDF |
| Laporan | Reports by date range | `/laporan` | admin, staff | revenue by status |
| Users | User CRUD | `/users` | admin only | role admin/staff |
| Broadcast | WhatsApp broadcast | `/broadcast` | admin only | Fonnte (needs token) |

---

## 6. User Workflows (traced from source)

1. **Authentication**: `POST /api/login` → token → `localStorage` → `AuthContext` validates via `GET /api/me` → protected pages.
2. **Menu management**: admin creates menu (requires ≥1 resep, optional foto) → list/search/filter → toggle availability → edit/delete.
3. **Order management**: create order (pelanggan + tanggal_acara + items) → list/search → detail → update status → pay DP / pay full → download invoice PDF (auth) or preview via public `invoice/{token}`.
4. **Reports**: date-range filter → order counts/revenue by status → top menu/customers.
5. **Customer management**: create/edit/delete customers (used during order creation via inline "Tambah Pelanggan" modal).
6. **Broadcast**: admin types a message → `POST /api/broadcast/send` → Fonnte (requires `FONNTE_TOKEN`, otherwise fails).

---

## 7. Testing Scope

**In scope (observable behavior via Playwright against `http://localhost:3000`):**
- Functional correctness of the UI forms and data presentation
- Form validation (required fields, invalid email, negative harga, empty order items)
- Navigation and protected-route authorization
- Authentication (valid/invalid credentials, logout)
- Authorization (admin-only vs admin+staff routes)
- CRUD for menu, bahan, pelanggan, order, users, resep
- Order status transitions and payments (DP / full)
- Invoice preview via public token
- Search, filtering, pagination
- Empty states

**Out of scope:**
- Backend unit/feature tests (Pest already exists in `hw-catering/tests`)
- PDF binary content verification
- Fonnte SMS delivery (external, requires token)
- The landing page's external WhatsApp/maps links

---

## 8. Testing Limitations (documented, not assumed)

1. **Playwright browser availability**: This host is Ubuntu 26.04. Playwright's packaged Chromium/Firefox/WebKit are NOT available for this platform. Only the system Google Chrome (`/usr/bin/google-chrome-stable`) works, via Playwright `channel: 'chrome'`. Tests are configured for Chromium only; Firefox/WebKit are intentionally omitted.
2. **Seeded `staff@katering.com` login anomaly**: `password_verify('password', staffHash)` returns true in isolation, but `POST /api/login` for `staff@katering.com` returns 401/422 via both curl and Playwright. Admin login works. A freshly created staff user (via API) logs in successfully. Staff-role tests therefore create a temporary staff user via the API rather than relying on the seeded account. This is recorded as a potential defect/observation.
3. **Auth via `register`**: `AuthController::register` exists but is NOT registered in `routes/api.php` — registration cannot be tested through the routed API.
4. **Modal form labels**: The CRUD modal `<label>` elements are not bound to inputs via `for`/`id` and most inputs lack `placeholder`, so Playwright `getByLabel`/`getByPlaceholder` do not work on modals. Tests locate modal inputs by visible label-text traversal (a best-effort accessible approximation). This is also a front-end accessibility observation.
5. **Video recording**: disabled (`video: off`) because ffmpeg is not packaged for Ubuntu 26.04. Screenshots and traces are retained on failure.
6. **No destructive production operations**: All tests run against the local test database (`hw_katering`) using seeded/temporary data; created resources are cleaned up via the API after each test.

---

## 9. Environment (used for execution)

- Backend: `php artisan serve` on `http://127.0.0.1:8000` (running)
- Frontend: `npm run dev` on `http://localhost:3000` (running)
- DB: MySQL `hw_katering`, user `hw`/`password123`
- Playwright config: `fe-hw-catering/playwright.config.ts` (Chromium via system Chrome channel)
- Servers were already running in this environment; `scripts/start-servers.sh` is idempotent and reused them.
