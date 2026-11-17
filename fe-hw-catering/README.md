# Aplikasi Katering - Frontend

Aplikasi manajemen katering berbasis web yang dibangun dengan Next.js, React, dan TailwindCSS.

## 📋 Deskripsi

Sistem informasi manajemen katering yang menyediakan fitur-fitur:
- 🔐 Autentikasi dan Otorisasi (Admin & Staff)
- 📊 Dashboard dengan statistik dan analytics
- 🍱 Manajemen Menu & Resep
- 🥬 Manajemen Bahan & Stok
- 👥 Manajemen Pelanggan
- 📦 Manajemen Order & Status
- 📈 Laporan Penjualan & Analisis

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.4 (Pages Router)
- **UI Library**: React 19.2.3
- **Styling**: TailwindCSS 4
- **Language**: TypeScript & JavaScript
- **State Management**: React Context API

## 📦 Prasyarat

Pastikan sudah terinstal:
- **Node.js** versi 18.x atau lebih tinggi
- **npm** atau **yarn** atau **pnpm**
- **Backend API** sudah berjalan di `http://127.0.0.1:8000`

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd fe-hw-catering
```

### 2. Install Dependencies

Menggunakan npm:
```bash
npm install
```

Atau menggunakan yarn:
```bash
yarn install
```

Atau menggunakan pnpm:
```bash
pnpm install
```

### 3. Konfigurasi Backend API

Pastikan URL backend API sudah sesuai. Cek file:
- `src/lib/api/auth.ts` - ubah `API_URL` jika backend berjalan di URL lain

```typescript
const API_URL = 'http://127.0.0.1:8000/api'; // sesuaikan dengan backend
```

### 4. Jalankan Development Server

```bash
npm run dev
```

atau

```bash
yarn dev
```

atau

```bash
pnpm dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

## 📝 Scripts

- `npm run dev` - Menjalankan development server
- `npm run build` - Build aplikasi untuk production
- `npm start` - Menjalankan production server
- `npm run lint` - Menjalankan ESLint untuk cek kode

## 🔑 Default Login

Gunakan akun yang sudah dibuat di backend. Contoh:
- **Email**: admin@example.com
- **Password**: password

## 📁 Struktur Folder

```
fe-hw-catering/
├── public/              # Asset statis (images, logo, dll)
├── src/
│   ├── components/      # React components
│   │   ├── Layout.tsx
│   │   ├── Modal.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ...
│   ├── contexts/        # React Context (Auth, dll)
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   └── api/         # API services
│   │       ├── auth.ts
│   │       ├── dashboard.ts
│   │       ├── menu.ts
│   │       ├── order.ts
│   │       └── ...
│   ├── pages/           # Next.js pages (routing)
│   │   ├── index.js     # Landing page (redirect)
│   │   ├── login.tsx
│   │   ├── dashboard.tsx
│   │   ├── menu/
│   │   ├── order/
│   │   ├── laporan/
│   │   └── ...
│   └── styles/          # Global styles
├── DESIGN_GUIDELINES.md # Panduan desain UI
└── package.json
```

## 🎨 Design Guidelines

Project ini mengikuti design guidelines yang terdokumentasi di `DESIGN_GUIDELINES.md`:
- Primary color: Yellow (`yellow-500`, `yellow-600`)
- Typography: Inter font
- Modal tanpa overlay backdrop
- Konsistensi spacing dan border radius

## 🔗 Integrasi Backend

Aplikasi ini terhubung dengan Laravel backend. Pastikan:
1. Backend API sudah running di `http://127.0.0.1:8000`
2. CORS sudah dikonfigurasi dengan benar di backend
3. Database sudah di-migrate dan seed

## 🚧 Fitur Utama

### 1. Autentikasi
- Login & Logout
- Protected routes
- Token-based authentication

### 2. Dashboard
- Statistik order (hari ini, bulan ini)
- Grafik penjualan
- Alert stok rendah
- Menu & kategori terlaris
- Top pelanggan

### 3. Manajemen Menu
- CRUD menu
- Kategori menu
- Upload gambar
- Atur harga & porsi
- Link ke resep

### 4. Manajemen Resep
- CRUD resep
- Komposisi bahan
- Kalkulasi stok
- Detail instruksi

### 5. Manajemen Bahan
- CRUD bahan
- Monitoring stok
- Alert stok minimum
- Satuan pengukuran

### 6. Manajemen Pelanggan
- CRUD pelanggan
- Riwayat order
- Kontak & alamat

### 7. Manajemen Order
- Create order
- Update status order
- Detail item order
- Tracking status
- Cetak invoice

### 8. Laporan
- Laporan penjualan
- Filter by date range
- Export data
- Analytics

## 🐛 Troubleshooting

### Port 3000 sudah digunakan
```bash
# Gunakan port lain
PORT=3001 npm run dev
```

### Error koneksi ke backend
- Pastikan backend sudah running
- Cek URL di file `src/lib/api/auth.ts`
- Pastikan CORS dikonfigurasi dengan benar

### Error saat build
```bash
# Clear cache dan reinstall
rm -rf node_modules .next
npm install
npm run build
```

## 📞 Support

Jika ada masalah atau pertanyaan, silakan buat issue di repository ini.

## 📄 License

Private project - All rights reserved
