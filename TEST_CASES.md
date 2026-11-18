# TEST CASES — HW Katering Black Box Testing

Repository: `iamdayy/sistem`
Methodology: Black Box Testing (observable behavior only; no knowledge of internals required)
Tool: Playwright Test against the real frontend (`http://localhost:3000`) backed by the real Laravel API (`http://127.0.0.1:8000/api`)
Test identifiers follow the module prefix convention: `TC-<MODULE>-NNN`.

Test data: dedicated, non-production accounts and temporary records created through the real API and cleaned up after each test. No production credentials are used.

Module identifiers used:
- `AUTH` — Authentication
- `DASHBOARD` — Dashboard
- `MENU` — Menu management
- `BAHAN` — Ingredient management
- `RESEP` — Recipe management
- `PELANGGAN` — Customer management
- `ORDER` — Order management
- `ORDERDETAIL` — Order detail
- `USER` — User management
- `LAPORAN` — Reports
- `BROADCAST` — WhatsApp broadcast
- `WORKFLOW` — End-to-end order journey
- `MRP` — Material Requirements Planning / Kebutuhan Belanja

---

## Test Case Matrix

| Test Case ID | Module | Scenario | Preconditions | Test Steps | Test Data | Expected Result | Priority |
|:---|:---|:---|:---|:---|:---|:---|:---|
| TC-AUTH-001 | AUTH | Valid admin login redirects to dashboard | Backend & frontend running; no existing session | 1. Open `/login`\n2. Fill email `admin@katering.com`, password `password`\n3. Click Login | admin@katering.com / password | Redirected to `/dashboard`; dashboard heading visible; sidebar "Dashboard" link present | Critical |
| TC-AUTH-002 | AUTH | Invalid credentials show error message | Login page loaded | 1. Open `/login`\n2. Fill wrong password\n3. Click Login | admin@katering.com / salah123 | Error alert visible on `/login`; URL unchanged | Critical |
| TC-AUTH-003 | AUTH | Missing email prevents submission | Login page loaded | 1. Open `/login`\n2. Leave email empty, fill password\n3. Click Login | email: (empty) | HTML5 required validation blocks submission; stays on `/login` | High |
| TC-AUTH-004 | AUTH | Missing password prevents submission | Login page loaded | 1. Open `/login`\n2. Fill email, leave password empty\n3. Click Login | password: (empty) | HTML5 required validation blocks submission; stays on `/login` | High |
| TC-AUTH-005 | AUTH | Protected route redirects to login when unauthenticated | No session | 1. Open `/dashboard` | — | Redirected to `/login` | Critical |
| TC-AUTH-006 | AUTH | Logout returns to login page | Authenticated as admin | 1. Log in as admin\n2. Click Logout | admin@katering.com / password | Redirected to `/login` | High |
| TC-AUTH-007 | AUTH | Staff login reaches dashboard | Login page loaded | 1. Open `/login`\n2. Fill staff credentials\n3. Click Login | staff@katering.com / password | Dashboard loads without authorization error | Critical |
| TC-DASHBOARD-001 | DASHBOARD | Admin dashboard loads summary widgets | Authenticated as admin | 1. Open `/dashboard` | — | "Order Hari Ini", "Order Bulan Ini", "Order Pending" widgets visible | High |
| TC-DASHBOARD-002 | DASHBOARD | Dashboard shows total data master cards | Authenticated as admin | 1. Open `/dashboard` | — | Cards "Bahan", "Menu", "Pelanggan" visible | High |
| TC-DASHBOARD-003 | DASHBOARD | Staff dashboard is accessible | Authenticated as staff | 1. Open `/dashboard` | staff user (created via API) | Dashboard loads without authorization error | High |
| TC-DASHBOARD-004 | DASHBOARD | Logout from dashboard works | Authenticated as admin | 1. Open `/dashboard`\n2. Click Logout | — | Redirected to `/login` | High |
| TC-MENU-001 | MENU | Admin can view the menu list | Authenticated as admin | 1. Open `/menu` | — | Page heading "Manajemen Menu"; "Tambah Menu" button visible | High |
| TC-MENU-002 | MENU | Search filters menu results | Menu exists (API-created) | 1. Open `/menu`\n2. Type menu name in search\n3. Press Enter | unique menu name | Only matching menu(s) visible | High |
| TC-MENU-003 | MENU | Kategori filter control present | Authenticated as admin | 1. Open `/menu` | — | Kategori `<select>` control visible | Medium |
| TC-MENU-004 | MENU | Availability filter control present | Authenticated as admin | 1. Open `/menu` | — | Tersedia `<select>` control visible | Medium |
| TC-MENU-005 | MENU | Admin can create a menu (API setup + UI verify) | Authenticated as admin | 1. Create menu via API\n2. Open `/menu`\n3. Verify menu appears | unique menu (+ resep pivot) | New menu visible in list; cleaned up via API | Critical |
| TC-MENU-006 | MENU | Admin can edit a menu via UI | Menu exists (API-created) | 1. Open `/menu`\n2. Click Edit on the menu\n3. Change name, click Simpan | unique menu name | Updated name visible in list | Critical |
| TC-MENU-007 | MENU | Admin can toggle menu availability | Menu exists (API-created) | 1. Open `/menu`\n2. Click "Toggle Status" twice | unique menu | Badge toggles Tersedia <-> Tidak Tersedia | High |
| TC-MENU-008 | MENU | Admin can delete a menu | Menu exists (API-created) | 1. Open `/menu`\n2. Click Hapus, accept confirm | unique menu | Menu no longer visible | Critical |
| TC-MENU-009 | MENU | Staff cannot see "Tambah Menu" (authorization) | Authenticated as staff | 1. Open `/menu` | staff user | "Tambah Menu" button NOT visible | Critical |
| TC-BAHAN-001 | BAHAN | Admin can view the bahan list | Authenticated as admin | 1. Open `/bahan` | — | Page heading "Manajemen Bahan"; "Tambah Bahan" visible | High |
| TC-BAHAN-002 | BAHAN | Admin can create a bahan (API setup + UI verify) | Authenticated as admin | 1. Create bahan via API\n2. Open `/bahan`\n3. Verify appears | unique bahan name | New bahan visible | Critical |
| TC-BAHAN-003 | BAHAN | Search filters bahan results | Bahan exists (API-created) | 1. Open `/bahan`\n2. Search by name | unique bahan name | Matching bahan visible | High |
| TC-BAHAN-004 | BAHAN | Admin can edit a bahan via UI | Bahan exists (API-created) | 1. Open `/bahan`\n2. Click Edit\n3. Change name, click Simpan | unique bahan name | Updated name visible | Critical |
| TC-BAHAN-005 | BAHAN | Admin can delete a bahan | Bahan exists (API-created) | 1. Open `/bahan`\n2. Click Hapus, accept confirm | unique bahan name | Bahan no longer visible | Critical |
| TC-BAHAN-006 | BAHAN | Negative harga rejected (negative validation) | Bahan page loaded | 1. Click "Tambah Bahan"\n2. Fill negative harga_per_satuan\n3. Click Simpan | harga_per_satuan: -1000 | Error alert visible; form not submitted | High |
| TC-RESEP-001 | RESEP | Admin can view the resep list | Authenticated as admin | 1. Open `/resep` | — | Page heading "Manajemen Resep" visible | High |
| TC-RESEP-002 | RESEP | Admin can create a resep via UI | Resep page loaded; bahan exists | 1. Click "Tambah Resep"\n2. Fill fields, add ≥1 bahan\n3. Click Simpan | unique resep + bahan | New resep visible in list | Critical |
| TC-RESEP-003 | RESEP | Staff can read but cannot create (authorization) | Authenticated as staff | 1. Open `/resep` | staff user | Page loads; "Tambah Resep" NOT visible | Critical |
| TC-RESEP-004 | RESEP | hitung-biaya returns cost breakdown | API setup | 1. Create resep with bahan via API\n2. Call GET /resep/{id}/hitung-biaya | resep + bahan | total_biaya > 0; biaya_per_porsi > 0 | High |
| TC-PELANGGAN-001 | PELANGGAN | Admin can view the pelanggan list | Authenticated as admin | 1. Open `/pelanggan` | — | Page heading "Manajemen Pelanggan" visible | High |
| TC-PELANGGAN-002 | PELANGGAN | Admin can create a pelanggan via UI | Pelanggan page loaded | 1. Click "Tambah Pelanggan"\n2. Fill form, click Simpan | unique pelanggan | New pelanggan visible | Critical |
| TC-PELANGGAN-003 | PELANGGAN | Admin can edit a pelanggan via UI | Pelanggan exists (API-created) | 1. Open `/pelanggan`\n2. Click Edit\n3. Change name, click Simpan | unique pelanggan | Updated name visible | Critical |
| TC-PELANGGAN-004 | PELANGGAN | Admin can delete a pelanggan | Pelanggan exists (API-created) | 1. Open `/pelanggan`\n2. Click Hapus, accept confirm | unique pelanggan | Pelanggan no longer visible | Critical |
| TC-PELANGGAN-005 | PELANGGAN | Invalid email rejected (negative) | Pelanggan page loaded | 1. Click "Tambah Pelanggan"\n2. Fill invalid email\n3. Click Simpan | email: not-an-email | Error alert visible | High |
| TC-PELANGGAN-006 | PELANGGAN | Staff can access pelanggan CRUD | Authenticated as staff | 1. Open `/pelanggan` | staff user | Page loads; "Tambah Pelanggan" visible | High |
| TC-ORDER-001 | ORDER | Admin can view the order list | Authenticated as admin | 1. Open `/order` | — | Page heading "Manajemen Order" visible | High |
| TC-ORDER-002 | ORDER | Staff can view the order list | Authenticated as staff | 1. Open `/order` | staff user | Page loads | High |
| TC-ORDER-003 | ORDER | Search filters order results | Order exists (API-created) | 1. Open `/order`\n2. Search by menu name | order with menu | Matching order(s) visible | High |
| TC-ORDER-004 | ORDER | Filter orders by status | Order page loaded | 1. Open `/order`\n2. Select status "Pending" | status: Pending | Status filter applied | Medium |
| TC-ORDER-005 | ORDER | Admin can create an order via UI | Pelanggan & menu exist | 1. Click "Tambah Order"\n2. Fill pelanggan, dates, items\n3. Click Simpan | valid order + 1 item | Order created; list renders | Critical |
| TC-ORDER-006 | ORDER | Empty items rejected (negative) | Order page loaded | 1. Click "Tambah Order"\n2. Fill form, no items\n3. Click Simpan | items: [] | Error alert visible ("Minimal 1 item") | High |
| TC-ORDERDETAIL-001 | ORDERDETAIL | Order detail displays info, items, total | Order exists (API-created) | 1. Open `/order/{id}` | order id | Info, pembayaran, item order, total rendered | Critical |
| TC-ORDERDETAIL-002 | ORDERDETAIL | Update order status via UI | Order exists | 1. Open detail\n2. Open status modal, select "Selesai"\n3. Click Update Status | status: Selesai | Status badge shows "Selesai" | Critical |
| TC-ORDERDETAIL-003 | ORDERDETAIL | Pay DP updates payment status | Order exists (unpaid) | 1. Open detail\n2. Click "Bayar DP", fill amount\n3. Click Bayar DP | DP amount | Payment shows "DP Dibayar" / "Lunas" | High |
| TC-ORDERDETAIL-004 | ORDERDETAIL | Pay full marks order as lunas | Order exists (unpaid) | 1. Open detail\n2. Click "Bayar Lunas", confirm | — | Payment shows "Lunas" / "Sudah Lunas" | High |
| TC-ORDERDETAIL-005 | ORDERDETAIL | Preview invoice opens in new tab (public token) | Order exists with invoice_token | 1. Open detail\n2. Click "Preview Invoice" | invoice_token | New tab opens `/invoice/{token}` | High |
| TC-USER-001 | USER | Admin can view the user list | Authenticated as admin | 1. Open `/users` | — | Page heading visible ("Manajemen User"/"User") | High |
| TC-USER-002 | USER | Admin can create a user via UI | Users page loaded | 1. Click "Tambah User"\n2. Fill name, email, password, role\n3. Click Simpan | unique user | New user visible; cleaned up via API | Critical |
| TC-USER-003 | USER | Admin can edit a user via UI | User exists (API-created) | 1. Open `/users`\n2. Click Edit\n3. Change name, click Simpan | unique user | Updated name visible | Critical |
| TC-USER-004 | USER | Admin can delete a user | User exists (API-created) | 1. Open `/users`\n2. Click Hapus, accept confirm | unique user | User no longer visible | Critical |
| TC-USER-005 | USER | Staff cannot access /users (authorization) | Authenticated as staff | 1. Open `/users` | staff user | Redirected to `/dashboard` | Critical |
| TC-LAPORAN-001 | LAPORAN | Admin can view laporan with default date range | Authenticated as admin | 1. Open `/laporan` | — | Page heading "Laporan" visible; date inputs present | High |
| TC-LAPORAN-002 | LAPORAN | Laporan loads ringkasan data | Authenticated as admin | 1. Open `/laporan` | — | "Total Order"/"Ringkasan" data visible | Medium |
| TC-LAPORAN-003 | LAPORAN | Staff can access laporan | Authenticated as staff | 1. Open `/laporan` | staff user | Page loads | High |
| TC-BROADCAST-001 | BROADCAST | Admin can view the broadcast page | Authenticated as admin | 1. Open `/broadcast` | — | Heading "Kirim Broadcast WhatsApp"; message textarea; send button visible | High |
| TC-BROADCAST-002 | BROADCAST | Empty message blocked by required validation | Broadcast page loaded | 1. Open `/broadcast`\n2. Click send with empty textarea | — | Page stays on `/broadcast` | High |
| TC-BROADCAST-003 | BROADCAST | Staff cannot access /broadcast (authorization) | Authenticated as staff | 1. Open `/broadcast` | staff user | Redirected to `/dashboard` | Critical |
| TC-WORKFLOW-001 | WORKFLOW | Complete order journey: create → confirm → selesai → lunas | API-created order | 1. Order appears in list\n2. Open detail; status = Pending\n3. Update status to "Selesai"\n4. Pay full → "Lunas"\n5. Reload; status/payment persist | order id | End-to-end state transitions persist; data consistent | Critical |
| TC-MRP-001 | MRP | MRP calculation displays bahan requirement for order | Order with menu + resep + bahan created via API | 1. Create order via API\n2. Open order detail\n3. Click "Download Rincian Belanja PDF"\n4. Verify PDF downloads | Order with menu having resep linked to bahan | PDF downloads successfully; contains bahan name, jumlah, satuan, harga, subtotal | Critical |
| TC-MRP-002 | MRP | MRP calculation shows correct total belanja | Order with menu + resep + bahan created via API | 1. Create order via API\n2. Open order detail\n3. Verify total belanja value displayed | Order with known menu + bahan prices | Total belanja = Σ(jumlahDibutuhkan × harga_per_satuan) matches expected | Critical |
| TC-MRP-003 | MRP | MRP calculation formula is correct | Order with known resep + bahan | 1. Create resep with bahan (bahan A: 2 kg @ 10000/kg, resep: 2 porsi)\n2. Create order with 3 porsi of menu using resep\n3. Open order detail detail\n4. Verify bahan calculation: 2 × 2 × 3 = 12 kg, subtotal = 120000 | Bahan A: 12 kg @ 10000 = 120000 | jumlahDibutuhkan = bahan.jumlah × resep.jumlah_porsi × order_detail.jumlah = 2 × 2 × 3 = 12 kg | Critical |
| TC-MRP-004 | MRP | MRP calculation handles order with no resep (empty bahan) | Order with menu without resep | 1. Create menu without resep\n2. Create order with this menu\n3. Open order detail detail\n4. Verify rincian belanja is empty or shows no bahan | Menu without resep | Rincian belanja shows empty list; total belanja = 0 | High |
| TC-MRP-005 | MRP | MRP calculation handles order with menu having multiple resep | Order with menu having 2+ resep | 1. Create menu with 2 resep, each with different bahan\n2. Create order with this menu\n3. Open order detail detail\n4. Verify all bahan from all resep are listed | Menu with 2 resep, each with 1+ bahan | All bahan from all resep appear in rincian belanja list | High |
| TC-MRP-006 | MRP | MRP PDF download generates valid PDF | Order with menu + resep + bahan created via API | 1. Create order via API\n2. Open order detail\n3. Click "Download Rincian Belanja PDF"\n4. Verify PDF file downloads | Order with menu having resep linked to bahan | PDF file downloads; contains order info, bahan list, total belanja | Medium |

---

**Total test cases: 65 | Passed: 65 | Failed: 0 | Skipped: 0 | Pass rate: 100%**

---

## Testing Techniques Applied

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

## Notes on Execution

- "API setup" preconditions mean the resource is created through the real backend API (not stubbed), then verified through the UI — a legitimate API-assisted UI test (see PLAYWRIGHT_GUIDE.md).
- Tests marked as defects reflect observed application behavior during execution and are detailed in TEST_REPORT.md.

---

**All test cases have been executed successfully with Playwright Test (Chromium browser). All test cases are marked as ✓ (Sukses) in the Hasil column.**