# Dokumentasi Aplikasi Manajemen Katering

## 📋 Daftar Isi
1. [Pendahuluan](#pendahuluan)
2. [Arsitektur Aplikasi](#arsitektur-aplikasi)
3. [Struktur Folder](#struktur-folder)
4. [Fitur Utama](#fitur-utama)
5. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
6. [Autentikasi & Otorisasi](#autentikasi--otorisasi)
7. [Panduan Penggunaan](#panduan-penggunaan)
8. [API Integration](#api-integration)
9. [Komponen Utama](#komponen-utama)
10. [State Management](#state-management)
11. [Routing](#routing)
12. [Styling & Design System](#styling--design-system)

---

## Pendahuluan

Aplikasi Manajemen Katering adalah sistem informasi berbasis web yang dibangun untuk membantu pengelolaan bisnis katering. Aplikasi ini menyediakan fitur-fitur lengkap mulai dari manajemen menu, bahan, resep, pelanggan, hingga pengelolaan order dan laporan penjualan.

### Tujuan Aplikasi
- Memudahkan pengelolaan operasional bisnis katering
- Menyediakan dashboard analytics untuk monitoring bisnis
- Mengelola inventori bahan baku dengan sistem alert stok rendah
- Memfasilitasi pembuatan dan tracking order pelanggan
- Menyediakan laporan penjualan yang komprehensif

---

## Arsitektur Aplikasi

### Frontend Architecture
```
┌─────────────────────────────────────────┐
│          Next.js Application            │
│  (Pages Router + React 19 + TypeScript) │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   ┌────▼────┐           ┌─────▼─────┐
   │  Pages  │           │ Components │
   │ Routing │           │   Reusable │
   └────┬────┘           └─────┬──────┘
        │                      │
   ┌────▼──────────────────────▼────┐
   │      Context API (Auth)        │
   │    Global State Management     │
   └────────────┬───────────────────┘
                │
   ┌────────────▼───────────────┐
   │    API Service Layer       │
   │  (HTTP Client + TypeScript)│
   └────────────┬───────────────┘
                │
   ┌────────────▼───────────────┐
   │   Laravel Backend API      │
   │  (REST API + JWT Auth)     │
   └────────────────────────────┘
```

### Tech Stack
- **Framework**: Next.js 16.1.4 dengan Pages Router
- **UI Library**: React 19.2.3
- **Language**: TypeScript & JavaScript
- **Styling**: TailwindCSS 4
- **State Management**: React Context API
- **Authentication**: JWT Token-based
- **HTTP Client**: Native Fetch API

---

## Struktur Folder

```
fe-hw-catering/
│
├── public/                      # Asset statis
│   ├── logo.png                # Logo aplikasi
│   └── images/                 # Gambar lainnya
│
├── src/
│   ├── components/             # React components
│   │   ├── Layout.tsx          # Layout wrapper dengan sidebar
│   │   ├── Sidebar.tsx         # Navigasi sidebar
│   │   ├── ProtectedRoute.tsx  # HOC untuk route protection
│   │   └── Modal.tsx           # (Optional) Modal component
│   │
│   ├── contexts/               # React Context
│   │   └── AuthContext.tsx     # Context autentikasi global
│   │
│   ├── lib/                    # Library & utilities
│   │   └── api/                # API service layer
│   │       ├── auth.ts         # Auth API (login, register, logout)
│   │       ├── dashboard.ts    # Dashboard & analytics API
│   │       ├── bahan.ts        # Bahan baku API
│   │       ├── resep.ts        # Resep API
│   │       ├── menu.ts         # Menu API
│   │       ├── pelanggan.ts    # Pelanggan API
│   │       ├── order.ts        # Order API
│   │       └── user.ts         # User management API
│   │
│   ├── pages/                  # Next.js pages (routing)
│   │   ├── _app.tsx            # App wrapper (providers)
│   │   ├── _document.js        # HTML document
│   │   ├── index.js            # Landing page (redirect)
│   │   ├── login.tsx           # Halaman login
│   │   ├── dashboard.tsx       # Dashboard utama
│   │   ├── bahan.tsx           # Halaman bahan baku
│   │   ├── resep.tsx           # Halaman resep
│   │   ├── menu.tsx            # Halaman menu
│   │   ├── pelanggan.tsx       # Halaman pelanggan
│   │   ├── order.tsx           # Halaman daftar order
│   │   ├── order/
│   │   │   └── [id].tsx        # Detail order (dynamic route)
│   │   ├── laporan.tsx         # Halaman laporan
│   │   └── users.tsx           # Halaman manajemen user
│   │
│   └── styles/                 # Global styles
│       └── globals.css         # TailwindCSS imports
│
├── DESIGN_GUIDELINES.md        # Panduan desain UI/UX
├── README.md                   # Setup & instalasi
├── DOKUMENTASI.md              # File ini
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript config
```

---

## Fitur Utama

### 1. Dashboard & Analytics
**File**: `src/pages/dashboard.tsx`

Fitur:
- **Summary Cards**: Menampilkan statistik order hari ini, bulan ini, pending orders, dan stok rendah
- **Date Range Filter**: Filter data berdasarkan rentang tanggal
- **Total Data Master**: Menampilkan jumlah bahan, resep, menu, dan pelanggan
- **Order Statistics**: Breakdown order berdasarkan status (pending, dikonfirmasi, diproses, dikirim, selesai, dibatalkan)
- **Low Stock Alert**: Tabel bahan dengan stok rendah (di bawah minimum)
- **Top Menu**: 5 menu terlaris dengan total penjualan
- **Top Kategori**: Kategori menu terlaris
- **Top Customers**: Pelanggan dengan pembelian terbanyak

API Endpoints:
- `GET /api/dashboard` - Data dashboard utama
- `GET /api/dashboard/summary` - Summary statistics

### 2. Manajemen Bahan Baku
**File**: `src/pages/bahan.tsx`

Fitur:
- CRUD lengkap (Create, Read, Update, Delete)
- Monitoring stok bahan
- Alert visual untuk stok rendah (merah jika di bawah minimum)
- Field: nama, satuan (kg, liter, gram, pcs, dll), stok, stok minimum

API Endpoints:
- `GET /api/bahan` - List semua bahan
- `POST /api/bahan` - Tambah bahan baru
- `PUT /api/bahan/:id` - Update bahan
- `DELETE /api/bahan/:id` - Hapus bahan

### 3. Manajemen Resep
**File**: `src/pages/resep.tsx`

Fitur:
- CRUD lengkap resep
- Komposisi bahan (multiple bahan per resep)
- Kalkulasi otomatis kebutuhan bahan
- Field: nama, deskripsi, porsi, detail bahan (bahan, jumlah, satuan)

API Endpoints:
- `GET /api/resep` - List semua resep
- `GET /api/resep/:id` - Detail resep dengan komposisi bahan
- `POST /api/resep` - Tambah resep baru
- `PUT /api/resep/:id` - Update resep
- `DELETE /api/resep/:id` - Hapus resep

### 4. Manajemen Menu
**File**: `src/pages/menu.tsx`

Fitur:
- CRUD lengkap menu
- Kategori menu (Appetizer, Main Course, Dessert, Beverage, Snack)
- Upload gambar menu
- Linking menu ke resep
- Field: nama, kategori, harga, porsi, deskripsi, gambar, resep_id

API Endpoints:
- `GET /api/menu` - List semua menu
- `GET /api/menu/:id` - Detail menu
- `POST /api/menu` - Tambah menu baru (multipart/form-data untuk upload gambar)
- `PUT /api/menu/:id` - Update menu
- `DELETE /api/menu/:id` - Hapus menu

### 5. Manajemen Pelanggan
**File**: `src/pages/pelanggan.tsx`

Fitur:
- CRUD lengkap pelanggan
- Riwayat order pelanggan
- Field: nama, email, telepon, alamat

API Endpoints:
- `GET /api/pelanggan` - List semua pelanggan
- `GET /api/pelanggan/:id` - Detail pelanggan
- `POST /api/pelanggan` - Tambah pelanggan baru
- `PUT /api/pelanggan/:id` - Update pelanggan
- `DELETE /api/pelanggan/:id` - Hapus pelanggan

### 6. Manajemen Order
**File**: `src/pages/order.tsx`, `src/pages/order/[id].tsx`

Fitur:
- Create order dengan multiple menu items
- Update status order (pending → dikonfirmasi → diproses → dikirim → selesai)
- Status pembayaran (belum bayar, DP, lunas)
- Pembayaran DP (Down Payment)
- Pelunasan pembayaran
- Generate & download invoice (PDF)
- Preview invoice di browser
- Detail order lengkap

Field Order:
- nomor_order (auto-generated)
- pelanggan_id
- tanggal_order
- tanggal_acara
- waktu_acara
- jumlah_tamu
- alamat_pengiriman
- catatan
- total_harga
- status
- payment_status

Field Order Detail:
- menu_id
- jumlah
- harga_satuan
- subtotal
- catatan

API Endpoints:
- `GET /api/order` - List semua order
- `GET /api/order/:id` - Detail order
- `POST /api/order` - Buat order baru
- `PUT /api/order/:id/status` - Update status order
- `POST /api/order/:id/pay-dp` - Bayar DP
- `POST /api/order/:id/pay-full` - Lunasi pembayaran
- `GET /api/order/:id/invoice/download` - Download invoice PDF
- `GET /api/order/invoice/:token` - Preview invoice (public)

### 7. Laporan Penjualan
**File**: `src/pages/laporan.tsx`

Fitur:
- Laporan penjualan dengan filter tanggal
- Summary total order dan pendapatan
- Breakdown per menu
- Export data (jika diperlukan)

API Endpoints:
- `GET /api/laporan` - Data laporan dengan filter

### 8. Manajemen User
**File**: `src/pages/users.tsx`

Fitur:
- CRUD user (khusus admin)
- Role-based (admin, staff)
- Field: name, email, password, role

API Endpoints:
- `GET /api/users` - List semua user
- `POST /api/users` - Tambah user baru
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Hapus user

---

## Teknologi yang Digunakan

### Frontend Stack

#### Next.js 16.1.4
- **Pages Router**: Routing berbasis file system
- **SSR & CSR**: Server-side rendering dan client-side rendering
- **API Routes**: Built-in API endpoints (jika diperlukan)
- **Image Optimization**: Next/Image untuk optimasi gambar

#### React 19.2.3
- **Hooks**: useState, useEffect, useContext, useRouter
- **Context API**: Global state management untuk auth
- **Component-based**: Reusable components

#### TypeScript
- **Type Safety**: Strict typing untuk data dan API
- **Interfaces**: Type definitions untuk semua entities
- **IntelliSense**: Better developer experience

#### TailwindCSS 4
- **Utility-first**: Styling dengan utility classes
- **Responsive**: Mobile-first responsive design
- **Customizable**: Custom color scheme (yellow primary)
- **No CSS files**: Semua styling inline di JSX

### Backend Integration
- **Laravel Backend**: REST API dengan JWT authentication
- **Base URL**: `http://127.0.0.1:8000/api`
- **Authentication**: Bearer token di headers
- **Content-Type**: `application/json` (kecuali upload file: `multipart/form-data`)

---

## Autentikasi & Otorisasi

### Authentication Flow

```
┌──────────┐
│  Login   │
│  Page    │
└────┬─────┘
     │
     │ POST /api/login
     ▼
┌──────────────┐
│   Backend    │
│   Validate   │
└────┬─────────┘
     │
     │ Return: { user, token }
     ▼
┌──────────────┐
│ Save to      │
│ localStorage │
│ & Context    │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│  Redirect    │
│  Dashboard   │
└──────────────┘
```

### AuthContext
**File**: `src/contexts/AuthContext.tsx`

```typescript
interface AuthContextType {
  user: User | null;           // Data user saat ini
  token: string | null;        // JWT token
  loading: boolean;            // Loading state
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;    // Status login
  isAdmin: boolean;            // Cek role admin
  isStaff: boolean;            // Cek role staff
}
```

### Protected Routes
**File**: `src/components/ProtectedRoute.tsx`

Component ini membungkus semua halaman yang memerlukan autentikasi:

```tsx
export default function SomePage() {
  return (
    <ProtectedRoute>
      <PageContent />
    </ProtectedRoute>
  );
}
```

Fitur:
- Redirect ke `/login` jika belum login
- Validasi token di setiap load
- Loading state saat validasi

### User Roles
1. **Admin**:
   - Full access ke semua fitur
   - Dapat manage users
   - Dapat edit/delete semua data

2. **Staff**:
   - Access ke semua fitur kecuali user management
   - Dapat manage order, menu, bahan, dll

---

## Panduan Penggunaan

### Setup & Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd fe-hw-catering

# 2. Install dependencies
npm install

# 3. Pastikan backend running di http://127.0.0.1:8000

# 4. Run development server
npm run dev

# 5. Buka browser: http://localhost:3000
```

### Login
1. Akses `http://localhost:3000`
2. Akan redirect ke `/login`
3. Masukkan email dan password
4. Klik "Login"
5. Akan redirect ke `/dashboard`

### Membuat Order Baru
1. Masuk ke menu "Order" di sidebar
2. Klik tombol "Tambah Order"
3. Pilih pelanggan
4. Isi detail order (tanggal acara, waktu, jumlah tamu, alamat)
5. Tambah menu items:
   - Pilih menu
   - Masukkan jumlah porsi
   - Tambahkan catatan (optional)
6. Total harga akan otomatis terhitung
7. Klik "Simpan Order"

### Update Status Order
1. Masuk ke detail order
2. Klik tombol "Update Status"
3. Pilih status baru dari dropdown
4. Klik "Update Status"

### Proses Pembayaran
1. **Bayar DP**:
   - Buka detail order
   - Klik "Bayar DP"
   - Masukkan jumlah DP
   - Konfirmasi

2. **Pelunasan**:
   - Buka detail order
   - Klik "Lunasi" atau "Bayar Lunas"
   - Sistem akan menghitung sisa pembayaran
   - Konfirmasi

### Generate Invoice
1. Buka detail order
2. Klik "Preview Invoice" untuk lihat di browser
3. Atau klik "Download Invoice" untuk download PDF

---

## API Integration

### Base Configuration
**File**: `src/lib/api/auth.ts` (dan semua file API lainnya)

```typescript
const API_URL = 'http://127.0.0.1:8000/api';
```

### Request Headers
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}` // Untuk authenticated requests
}
```

### Error Handling
Semua API call menggunakan try-catch pattern:

```typescript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
} catch (error) {
  throw error; // Re-throw untuk handling di component
}
```

### API Service Structure

#### Auth API (`src/lib/api/auth.ts`)
```typescript
export const authApi = {
  login: (data: LoginData) => Promise<AuthResponse>
  register: (data: RegisterData) => Promise<AuthResponse>
  logout: (token: string) => Promise<Response>
  me: (token: string) => Promise<UserResponse>
}
```

#### Dashboard API (`src/lib/api/dashboard.ts`)
```typescript
export const dashboardApi = {
  getData: (token, dateRange) => Promise<DashboardData>
  getSummary: (token) => Promise<DashboardSummary>
}
```

#### Order API (`src/lib/api/order.ts`)
```typescript
export const orderApi = {
  getAll: (token) => Promise<Order[]>
  getById: (token, id) => Promise<Order>
  create: (token, data) => Promise<Order>
  updateStatus: (token, id, status) => Promise<Response>
  payDP: (token, id, amount) => Promise<Response>
  payFull: (token, id) => Promise<Response>
  downloadInvoice: (token, id) => Promise<void>
  previewInvoicePublic: (invoiceToken) => string
}
```

Dan seterusnya untuk API lainnya (bahan, resep, menu, pelanggan, user).

---

## Komponen Utama

### Layout Component
**File**: `src/components/Layout.tsx`

Wrapper untuk semua halaman yang sudah login. Menyediakan:
- Header dengan user info dan logout button
- Sidebar navigasi
- Main content area

```tsx
<Layout>
  <div className="space-y-6">
    {/* Page content */}
  </div>
</Layout>
```

### Sidebar Component
**File**: `src/components/Sidebar.tsx`

Navigasi menu dengan highlight active page:
- Dashboard
- Bahan Baku
- Resep
- Menu
- Pelanggan
- Order
- Laporan
- Users (khusus admin)

### ProtectedRoute Component
**File**: `src/components/ProtectedRoute.tsx`

Higher-Order Component untuk route protection:
- Cek authentication status
- Validasi token
- Redirect jika belum login
- Show loading state

---

## State Management

### Global State (Auth Context)
Menggunakan React Context API untuk state global authentication:

```tsx
// Provider di _app.tsx
<AuthProvider>
  <Component {...pageProps} />
</AuthProvider>

// Consume di component
const { user, token, isAuthenticated, login, logout } = useAuth();
```

### Local State (useState)
Setiap halaman/component menggunakan local state untuk:
- Data list (bahan, resep, menu, dll)
- Form data
- Modal visibility
- Loading state
- Error messages
- Success messages

Contoh pattern:
```typescript
const [data, setData] = useState<Type[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [showModal, setShowModal] = useState(false);
const [formData, setFormData] = useState<FormType>({ ... });
```

---

## Routing

### Next.js Pages Router

Routing berbasis file system:

```
/                     → pages/index.js           (redirect ke dashboard)
/login               → pages/login.tsx
/dashboard           → pages/dashboard.tsx
/bahan               → pages/bahan.tsx
/resep               → pages/resep.tsx
/menu                → pages/menu.tsx
/pelanggan           → pages/pelanggan.tsx
/order               → pages/order.tsx
/order/[id]          → pages/order/[id].tsx     (dynamic route)
/laporan             → pages/laporan.tsx
/users               → pages/users.tsx
```

### Navigation
Menggunakan Next.js `Link` component:

```tsx
import Link from 'next/link';

<Link href="/dashboard">
  Dashboard
</Link>
```

Atau programmatic navigation dengan `useRouter`:

```tsx
import { useRouter } from 'next/router';

const router = useRouter();
router.push('/dashboard');
```

---

## Styling & Design System

### Design Guidelines
**Lihat file**: `DESIGN_GUIDELINES.md`

### Color Scheme
- **Primary**: Yellow (`yellow-500`, `yellow-600`)
- **Background**: `gray-50`
- **Card**: `white` dengan border `gray-200`
- **Text**: `gray-900` (primary), `gray-700` (secondary), `gray-500` (muted)

### Modal Design (PENTING!)
**Tanpa background overlay/backdrop**

```tsx
// ✅ Benar - Tanpa overlay
<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-gray-200">
    {/* Modal content */}
  </div>
</div>

// ❌ Salah - Dengan overlay gelap
<div className="fixed inset-0 bg-black bg-opacity-50 ...">
```

### Button Styles
```tsx
// Primary (Yellow)
className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"

// Secondary (Gray)
className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"

// Danger (Red)
className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
```

### Form Input
```tsx
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
```

### Alert Messages
```tsx
// Success
className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"

// Error
className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"

// Warning
className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg"
```

---

## Best Practices

### 1. Type Safety
Selalu definisikan interface untuk data:

```typescript
interface Order {
  id: number;
  nomor_order: string;
  pelanggan_id: number;
  // ... dll
}
```

### 2. Error Handling
Selalu tangani error dengan user-friendly message:

```typescript
try {
  await api.call();
} catch (err: any) {
  setError(err.message || 'Terjadi kesalahan');
  setTimeout(() => setError(''), 3000); // Auto-hide
}
```

### 3. Loading States
Berikan feedback visual saat loading:

```tsx
{loading ? (
  <p className="text-gray-500">Loading...</p>
) : (
  <DataComponent />
)}
```

### 4. Success Feedback
Tampilkan pesan sukses setelah aksi berhasil:

```typescript
setSuccessMessage('Data berhasil disimpan');
setTimeout(() => setSuccessMessage(''), 3000);
```

### 5. Form Validation
Validasi input sebelum submit:

```typescript
if (!formData.nama) {
  setError('Nama harus diisi');
  return;
}
```

### 6. Token Management
Selalu kirim token di header untuk authenticated requests:

```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## Troubleshooting

### 1. Error: Cannot read property of undefined
- Pastikan data sudah di-fetch sebelum dirender
- Gunakan optional chaining: `data?.property`
- Cek loading state

### 2. 401 Unauthorized
- Token expired atau invalid
- Logout dan login kembali
- Cek token di localStorage

### 3. CORS Error
- Pastikan backend sudah konfigurasi CORS
- Cek URL backend di `API_URL`

### 4. Modal tidak muncul
- Cek state `showModal`
- Pastikan z-index cukup tinggi (z-50)

### 5. Styling tidak apply
- Clear cache browser
- Rebuild: `rm -rf .next && npm run dev`

---

## Development Workflow

### 1. Menambah Fitur Baru
```bash
# 1. Buat branch baru
git checkout -b feature/nama-fitur

# 2. Develop fitur
# - Buat API service di src/lib/api/
# - Buat page di src/pages/
# - Buat component jika perlu

# 3. Test fitur

# 4. Commit
git add .
git commit -m "feat: deskripsi fitur"

# 5. Push & PR
git push origin feature/nama-fitur
```

### 2. Testing Checklist
- [ ] Login & logout berfungsi
- [ ] Protected routes redirect dengan benar
- [ ] CRUD operations berfungsi
- [ ] Error handling tampil dengan baik
- [ ] Responsive di mobile
- [ ] Loading states tampil
- [ ] Success messages tampil

### 3. Code Review Checklist
- [ ] Type definitions lengkap
- [ ] Error handling proper
- [ ] No console.log yang tertinggal
- [ ] Styling konsisten dengan design guidelines
- [ ] No hardcoded values (gunakan constants)

---

## Referensi

### Dokumentasi External
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev/
- **TailwindCSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

### File Penting
- `README.md` - Setup & instalasi
- `DESIGN_GUIDELINES.md` - Panduan UI/UX
- `package.json` - Dependencies list
- `tsconfig.json` - TypeScript config

---

## Kontak & Support

Jika ada pertanyaan atau issue, silakan:
1. Cek dokumentasi ini terlebih dahulu
2. Cek file `DESIGN_GUIDELINES.md` untuk masalah UI
3. Buat issue di repository
4. Hubungi tim development

---

**Last Updated**: 27 Januari 2026
**Version**: 1.0.0
**Author**: Tim Development Aplikasi Katering
