# Dokumentasi Aplikasi Sistem Manajemen Katering

## 📋 Deskripsi Aplikasi

Aplikasi Sistem Manajemen Katering adalah platform berbasis web untuk mengelola bisnis katering secara komprehensif. Aplikasi ini dibangun menggunakan **Laravel 12** dan menyediakan REST API untuk mengelola operasional katering mulai dari manajemen bahan baku, resep, menu, pelanggan, hingga pesanan dan laporan.

## 🎯 Fitur Utama

### 1. **Manajemen Bahan Baku (Inventory)**
- Pencatatan bahan baku dengan detail (nama, satuan, stok, harga)
- Monitoring stok minimum untuk alert kebutuhan pembelian
- Update stok bahan baku (tambah/kurangi)
- Tracking harga per satuan untuk perhitungan biaya produksi

### 2. **Manajemen Resep**
- Pembuatan resep masakan dengan detail lengkap
- Daftar bahan yang dibutuhkan beserta jumlahnya
- Informasi cara membuat, porsi, waktu persiapan dan memasak
- Perhitungan biaya produksi otomatis berdasarkan harga bahan

### 3. **Manajemen Menu**
- Katalog menu katering dengan kategori
- Upload foto menu
- Harga jual dan status ketersediaan
- Hubungan menu dengan resep (many-to-many)
- Filter menu berdasarkan kategori dan ketersediaan

### 4. **Manajemen Pelanggan (CRM)**
- Database pelanggan dengan informasi kontak lengkap
- Riwayat pesanan per pelanggan
- Data nama, email, telepon, dan alamat

### 5. **Manajemen Pesanan (Order)**
- Pembuatan pesanan dengan detail acara
- Nomor order otomatis (format: ORD-YYYYMMDD-XXXX)
- Multi-item pesanan dengan catatan khusus per item
- Tracking status pesanan (6 tahap status)
- Validasi ketersediaan menu dan stok bahan
- Perhitungan total harga otomatis
- Pengurangan stok bahan otomatis saat order diproses

### 6. **Sistem Laporan**
- Laporan penjualan berdasarkan periode
- Statistik order berdasarkan status
- Analisis menu terlaris
- Total pendapatan dari order selesai

## 🔄 Alur Aplikasi

### A. Alur Persiapan Menu

```
1. Master Bahan Baku
   ↓
2. Buat Resep (+ tambah bahan yang diperlukan)
   ↓
3. Buat Menu (+ hubungkan dengan resep)
   ↓
4. Menu siap untuk dipesan
```

**Detail Proses:**
1. Admin menambahkan data bahan baku ke inventory (nama, satuan, stok, harga)
2. Admin membuat resep dan menambahkan bahan-bahan yang diperlukan beserta jumlahnya
3. Admin membuat menu katering dan menghubungkannya dengan satu atau lebih resep
4. Menu siap ditampilkan dan dapat dipesan oleh pelanggan

### B. Alur Pemesanan

```
1. Pendaftaran/Data Pelanggan
   ↓
2. Pilih Menu & Buat Pesanan
   ↓
3. Validasi Ketersediaan Menu
   ↓
4. Hitung Total & Buat Order (Status: Pending)
   ↓
5. Konfirmasi Order (Status: Dikonfirmasi)
   ↓
6. Proses Order (Status: Diproses)
   ├─ Validasi Stok Bahan
   └─ Pengurangan Stok Otomatis
   ↓
7. Pengiriman (Status: Dikirim)
   ↓
8. Selesai (Status: Selesai)
```

**Detail Status Order:**
- **Pending**: Order baru dibuat, menunggu konfirmasi
- **Dikonfirmasi**: Order sudah dikonfirmasi admin
- **Diproses**: Order sedang diproses, stok bahan dikurangi otomatis
- **Dikirim**: Order dalam perjalanan ke lokasi acara
- **Selesai**: Order selesai dan acara telah berlangsung
- **Dibatalkan**: Order dibatalkan (bisa dari admin atau pelanggan)

### C. Alur Manajemen Stok Bahan

```
1. Order Masuk (Status: Dikonfirmasi)
   ↓
2. Update Status → Diproses
   ↓
3. Sistem Validasi Stok:
   ├─ Cek setiap menu dalam order
   ├─ Cek resep dari menu
   ├─ Cek bahan dari resep
   └─ Hitung total bahan dibutuhkan
   ↓
4. Jika Stok Cukup:
   └─ Kurangi stok bahan secara otomatis
   ↓
5. Jika Stok Tidak Cukup:
   └─ Tolak proses & kirim notifikasi error
```

## 📊 Struktur Database

### Tabel Utama

1. **bahan** - Master bahan baku
   - id, nama, satuan, stok, harga_per_satuan, stok_minimum, deskripsi

2. **resep** - Master resep masakan
   - id, nama, deskripsi, cara_membuat, porsi, waktu_persiapan, waktu_memasak

3. **resep_bahan** - Relasi resep dengan bahan (pivot table)
   - resep_id, bahan_id, jumlah, satuan

4. **menu** - Katalog menu katering
   - id, nama, deskripsi, harga, kategori, foto, tersedia

5. **menu_resep** - Relasi menu dengan resep (pivot table)
   - menu_id, resep_id, jumlah_porsi

6. **pelanggan** - Data pelanggan
   - id, nama, email, telepon, alamat

7. **orders** - Header pesanan
   - id, nomor_order, pelanggan_id, tanggal_order, tanggal_acara, waktu_acara, alamat_pengiriman, jumlah_tamu, total_harga, status, catatan

8. **order_detail** - Detail item pesanan
   - id, order_id, menu_id, jumlah, harga_satuan, subtotal, catatan

### Relasi Antar Tabel

```
Bahan ←→ Resep (Many-to-Many via resep_bahan)
Resep ←→ Menu (Many-to-Many via menu_resep)
Pelanggan → Orders (One-to-Many)
Orders → OrderDetail (One-to-Many)
Menu → OrderDetail (One-to-Many)
```

## 🔌 API Endpoints

### Bahan (Inventory)
```
GET    /api/bahan              - List semua bahan
POST   /api/bahan              - Tambah bahan baru
GET    /api/bahan/{id}         - Detail bahan
PUT    /api/bahan/{id}         - Update bahan
DELETE /api/bahan/{id}         - Hapus bahan
POST   /api/bahan/{id}/update-stok - Update stok bahan
```

### Resep
```
GET    /api/resep              - List semua resep
POST   /api/resep              - Tambah resep baru
GET    /api/resep/{id}         - Detail resep
PUT    /api/resep/{id}         - Update resep
DELETE /api/resep/{id}         - Hapus resep
GET    /api/resep/{id}/hitung-biaya - Hitung biaya produksi
```

### Menu
```
GET    /api/menu               - List semua menu
POST   /api/menu               - Tambah menu baru
GET    /api/menu/kategori      - List kategori menu
GET    /api/menu/{id}          - Detail menu
POST   /api/menu/{id}          - Update menu (support file upload)
DELETE /api/menu/{id}          - Hapus menu
POST   /api/menu/{id}/toggle-availability - Toggle status tersedia
```

### Pelanggan
```
GET    /api/pelanggan          - List semua pelanggan
POST   /api/pelanggan          - Tambah pelanggan baru
GET    /api/pelanggan/{id}     - Detail pelanggan
PUT    /api/pelanggan/{id}     - Update pelanggan
DELETE /api/pelanggan/{id}     - Hapus pelanggan
```

### Orders
```
GET    /api/orders             - List semua order (support filter & search)
POST   /api/orders             - Buat order baru
GET    /api/orders/laporan     - Laporan order berdasarkan periode
GET    /api/orders/{id}        - Detail order
PUT    /api/orders/{id}        - Update order
DELETE /api/orders/{id}        - Hapus order (hanya status pending)
POST   /api/orders/{id}/update-status - Update status order
```

## 🎨 Fitur Khusus

### 1. Auto-Generate Nomor Order
Setiap order baru otomatis mendapat nomor unik dengan format:
```
ORD-YYYYMMDD-XXXX
Contoh: ORD-20260125-0001
```

### 2. Validasi Stok Otomatis
Ketika order berubah status menjadi "diproses", sistem akan:
- Menghitung total kebutuhan bahan untuk semua menu dalam order
- Memvalidasi apakah stok mencukupi
- Menolak jika stok tidak cukup dengan pesan error spesifik
- Mengurangi stok otomatis jika validasi berhasil

### 3. Perhitungan Biaya Produksi
Endpoint khusus untuk menghitung biaya produksi resep berdasarkan:
- Harga bahan per satuan
- Jumlah bahan yang digunakan
- Total biaya seluruh bahan dalam resep

### 4. Filter dan Pencarian
- **Bahan**: Search by nama, filter by stok minimum
- **Resep**: Search by nama
- **Menu**: Search by nama, filter by kategori & ketersediaan
- **Pelanggan**: Search by nama/email/telepon
- **Order**: Search by nomor order/nama pelanggan, filter by status & periode tanggal

### 5. Upload Foto Menu
Mendukung upload foto untuk menu dengan validasi:
- Format: JPEG, PNG, JPG
- Ukuran maksimal: 2MB
- Auto-delete foto lama saat update

### 6. Laporan Komprehensif
Laporan order menyediakan:
- Total order dalam periode
- Total pendapatan (hanya dari order selesai)
- Breakdown jumlah order per status
- Top 10 menu terlaris
- List detail semua order dalam periode

## 🔐 Business Rules

1. **Order hanya bisa dihapus** jika statusnya "pending"
2. **Order tidak bisa diupdate** jika statusnya "selesai" atau "dibatalkan"
3. **Stok bahan dikurangi** hanya saat status order berubah menjadi "diproses"
4. **Menu tidak bisa dipesan** jika status tersedia = false
5. **Tanggal acara** harus sama atau setelah tanggal order
6. **Pelanggan tidak bisa dihapus** jika masih memiliki order (cascade delete)

## 🛠️ Teknologi yang Digunakan

- **Framework**: Laravel 12
- **PHP Version**: ^8.2
- **Database**: MySQL/PostgreSQL/SQLite (configurable)
- **File Storage**: Laravel Storage (public disk)
- **API Response**: JSON format

## 📁 Struktur Kode

```
app/
├── Http/
│   └── Controllers/
│       └── Api/
│           ├── BahanController.php
│           ├── ResepController.php
│           ├── MenuController.php
│           ├── PelangganController.php
│           └── OrderController.php
├── Models/
│   ├── Bahan.php
│   ├── Resep.php
│   ├── Menu.php
│   ├── Pelanggan.php
│   ├── Order.php
│   └── OrderDetail.php

database/
└── migrations/
    ├── create_bahan_table.php
    ├── create_resep_table.php
    ├── create_resep_bahan_table.php
    ├── create_menu_table.php
    ├── create_menu_resep_table.php
    ├── create_pelanggan_table.php
    ├── create_orders_table.php
    └── create_order_detail_table.php

routes/
└── api.php
```

## 🚀 Cara Instalasi

```bash
# Clone repository
git clone [repository-url]

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Run migrations
php artisan migrate

# Create storage link
php artisan storage:link

# Run development server
php artisan serve
```

## 📝 Catatan Pengembangan

- Aplikasi menggunakan pagination default 15 items per halaman
- Semua response API menggunakan format JSON standar dengan structure:
  ```json
  {
    "success": true/false,
    "message": "Pesan response",
    "data": {...}
  }
  ```
- Error handling menggunakan try-catch dengan database transaction
- Validasi input menggunakan Laravel Validator
- Relasi database menggunakan Eloquent ORM

## 🔄 Future Enhancements (Rekomendasi)

1. Implementasi autentikasi (Laravel Sanctum)
2. Role-based access control (Admin, Staff, Customer)
3. Notifikasi email/SMS untuk order
4. Export laporan ke PDF/Excel
5. Dashboard analytics dengan chart
6. Fitur promo dan diskon
7. Sistem pembayaran online
8. Rating dan review menu
9. Integrasi dengan sistem akuntansi
10. Mobile app (Flutter/React Native)

---

**Versi Dokumentasi**: 1.0
**Tanggal**: 25 Januari 2026
**Platform**: Laravel 12
