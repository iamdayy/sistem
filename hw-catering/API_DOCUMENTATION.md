# Dokumentasi API Aplikasi Catering

## Base URL
```
http://localhost/hw-katering/public/api
```

## Authentication

Aplikasi ini menggunakan Laravel Sanctum untuk autentikasi berbasis token.

**Catatan:** Endpoint `/register` tidak tersedia untuk public. User baru hanya dapat dibuat oleh Admin melalui endpoint `POST /users`.

### Login
```
POST /login
```
Request Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "staff"
    },
    "token": "2|zyxwvutsrqponmlkjihgfedcba0987654321"
  }
}
```

### Logout
```
POST /logout
```
Headers:
```
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "message": "Logout berhasil"
}
```

### Get Current User
```
GET /me
```
Headers:
```
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "message": "Data user berhasil diambil",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "staff"
  }
}
```

---

## Authorization & Roles

Aplikasi memiliki 2 role pengguna:

### 1. Admin
Memiliki akses penuh ke semua fitur:
- ✅ Manajemen Bahan (CRUD + Update Stok)
- ✅ Manajemen Resep (CRUD + Hitung Biaya)
- ✅ Manajemen Menu (CRUD + Toggle Availability)
- ✅ Manajemen Pelanggan (CRUD)
- ✅ Manajemen Order (CRUD + Update Status + Laporan)
- ✅ Manajemen User (hanya admin yang bisa menambah admin baru)

### 2. Staff
Memiliki akses terbatas:
- ✅ Manajemen Menu (Read Only)
- ✅ Manajemen Pelanggan (CRUD)
- ✅ Manajemen Order (CRUD + Update Status)
- ❌ Tidak bisa akses Bahan
- ❌ Tidak bisa akses Resep
- ❌ Tidak bisa create/update/delete Menu
- ❌ Tidak bisa akses Laporan Order

### Cara Menggunakan Token

Setelah login, gunakan token yang diterima pada header setiap request:

```
Authorization: Bearer {your_token_here}
```

Contoh menggunakan cURL:
```bash
curl -H "Authorization: Bearer 1|abcdefghijklmnopqrstuvwxyz1234567890" \
     http://localhost/hw-katering/public/api/bahan
```

Contoh menggunakan JavaScript (Fetch):
```javascript
fetch('http://localhost/hw-katering/public/api/bahan', {
  headers: {
    'Authorization': 'Bearer 1|abcdefghijklmnopqrstuvwxyz1234567890',
    'Content-Type': 'application/json'
  }
})
```

---

## Daftar Endpoint

### 1. Dashboard

Dashboard API menyediakan statistik dan ringkasan untuk tampilan dashboard.

#### Get Dashboard Data (Admin & Staff)
```
GET /dashboard
```
**Required Role**: Admin, Staff

Query Parameters:
- `start_date` (optional): Tanggal mulai periode (format: YYYY-MM-DD, default: 30 hari yang lalu)
- `end_date` (optional): Tanggal akhir periode (format: YYYY-MM-DD, default: hari ini)

Response:
```json
{
  "success": true,
  "message": "Data dashboard berhasil diambil",
  "data": {
    "periode": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    },
    "total_data": {
      "bahan": 19,
      "resep": 6,
      "menu": 7,
      "pelanggan": 50
    },
    "order_statistics": {
      "total_orders": 120,
      "total_revenue": 15000000,
      "by_status": {
        "pending": 5,
        "dikonfirmasi": 10,
        "diproses": 8,
        "dikirim": 7,
        "selesai": 85,
        "dibatalkan": 5
      }
    },
    "bahan_stok_rendah": [
      {
        "id": 1,
        "nama": "Beras",
        "satuan": "kg",
        "stok": 15,
        "stok_minimum": 20
      }
    ],
    "menu_terlaris": [
      {
        "menu_id": 1,
        "total_terjual": 500,
        "total_pendapatan": 5000000,
        "menu": {
          "id": 1,
          "nama": "Nasi Kuning Standar",
          "harga": 15000,
          "kategori": "Nasi Box"
        }
      }
    ],
    "revenue_per_day": [
      {
        "tanggal": "2024-01-25",
        "total_order": 10,
        "total_pendapatan": 500000
      }
    ],
    "recent_orders": [],
    "customer_statistics": {
      "pelanggan_baru": 15,
      "top_pelanggan": [
        {
          "id": 1,
          "nama": "PT ABC",
          "orders_count": 25,
          "orders_sum_total_harga": 12500000
        }
      ]
    },
    "kategori_terlaris": [
      {
        "kategori": "Nasi Box",
        "total_terjual": 800
      }
    ]
  }
}
```

#### Get Dashboard Summary (Admin & Staff)
```
GET /dashboard/summary
```
**Required Role**: Admin, Staff

Ringkasan singkat untuk widget dashboard (hari ini & bulan ini).

Response:
```json
{
  "success": true,
  "message": "Ringkasan dashboard berhasil diambil",
  "data": {
    "today": {
      "orders": 5,
      "revenue": 250000
    },
    "this_month": {
      "orders": 120,
      "revenue": 15000000
    },
    "alerts": {
      "pending_orders": 5,
      "low_stock_items": 3
    }
  }
}
```

#### Get Dashboard Charts (Admin & Staff)
```
GET /dashboard/charts
```
**Required Role**: Admin, Staff

Query Parameters:
- `days` (optional): Jumlah hari ke belakang untuk data chart (default: 30)

Response:
```json
{
  "success": true,
  "message": "Data chart berhasil diambil",
  "data": {
    "daily_revenue": [
      {
        "date": "2024-01-25",
        "revenue": 500000,
        "orders": 10
      }
    ],
    "orders_by_status": [
      {
        "status": "selesai",
        "total": 85
      }
    ],
    "top_menus": [
      {
        "menu_id": 1,
        "total": 500,
        "menu": {
          "id": 1,
          "nama": "Nasi Kuning Standar",
          "kategori": "Nasi Box"
        }
      }
    ]
  }
}
```

---

### 2. Manajemen User

API untuk mengelola user (admin dan staff). Hanya admin yang dapat mengakses endpoint ini.

#### Get All Users (Admin Only)
```
GET /users
```
**Required Role**: Admin

Query Parameters:
- `search` (optional): Cari berdasarkan nama atau email
- `role` (optional): Filter berdasarkan role (admin/staff)
- `per_page` (optional): Jumlah data per halaman (default: 15)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Data user berhasil diambil",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "admin",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
      },
      {
        "id": 2,
        "name": "Staff User",
        "email": "staff@example.com",
        "role": "staff",
        "created_at": "2024-01-02T00:00:00.000000Z",
        "updated_at": "2024-01-02T00:00:00.000000Z"
      }
    ],
    "per_page": 15,
    "total": 2
  }
}
```

#### Create User (Admin Only)
```
POST /users
```
**Required Role**: Admin

Request Body:
```json
{
  "name": "New Staff",
  "email": "newstaff@example.com",
  "password": "password123",
  "role": "staff"
}
```

**Field Validasi:**
- `name` (required, string, max 255)
- `email` (required, email, unique)
- `password` (required, min 8 karakter)
- `role` (required, enum: admin/staff)

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User berhasil dibuat",
  "data": {
    "id": 3,
    "name": "New Staff",
    "email": "newstaff@example.com",
    "role": "staff",
    "created_at": "2024-01-26T12:00:00.000000Z",
    "updated_at": "2024-01-26T12:00:00.000000Z"
  }
}
```

**Error Response (422 Validation Error):**
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": {
    "email": ["The email has already been taken."]
  }
}
```

#### Get Single User (Admin Only)
```
GET /users/{id}
```
**Required Role**: Admin

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Data user berhasil diambil",
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "User tidak ditemukan"
}
```

#### Update User (Admin Only)
```
PUT /users/{id}
```
**Required Role**: Admin

Request Body (semua field optional):
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "password": "newpassword123",
  "role": "admin"
}
```

**Field Validasi:**
- `name` (optional, string, max 255)
- `email` (optional, email, unique kecuali user sendiri)
- `password` (optional, min 8 karakter)
- `role` (optional, enum: admin/staff)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User berhasil diupdate",
  "data": {
    "id": 2,
    "name": "Updated Name",
    "email": "newemail@example.com",
    "role": "admin",
    "created_at": "2024-01-02T00:00:00.000000Z",
    "updated_at": "2024-01-26T12:30:00.000000Z"
  }
}
```

#### Delete User (Admin Only)
```
DELETE /users/{id}
```
**Required Role**: Admin

**Validasi:**
- User tidak dapat menghapus akun sendiri

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User berhasil dihapus"
}
```

**Error Response (400 Bad Request) - Hapus akun sendiri:**
```json
{
  "success": false,
  "message": "Tidak dapat menghapus akun sendiri"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "User tidak ditemukan"
}
```

---

### 3. Manajemen Bahan

#### Get All Bahan (Admin Only)
```
GET /bahan
```
**Required Role**: Admin
Query Parameters:
- `search` (optional): Cari berdasarkan nama bahan
- `stok_rendah` (optional): Filter bahan dengan stok di bawah minimum
- `per_page` (optional): Jumlah data per halaman (default: 15)

Response:
```json
{
  "success": true,
  "message": "Data bahan berhasil diambil",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "nama": "Beras",
        "satuan": "kg",
        "stok": 100.00,
        "harga_per_satuan": 12000.00,
        "stok_minimum": 50.00,
        "deskripsi": "Beras premium"
      }
    ]
  }
}
```

#### Create Bahan (Admin Only)
```
POST /bahan
```
**Required Role**: Admin


Request Body:
```json
{
  "nama": "Beras",
  "satuan": "kg",
  "stok": 100,
  "harga_per_satuan": 12000,
  "stok_minimum": 50,
  "deskripsi": "Beras premium"
}
```

#### Get Single Bahan (Admin Only)
```
GET /bahan/{id}
```
**Required Role**: Admin

#### Update Bahan (Admin Only)
```
PUT /bahan/{id}
```
**Required Role**: Admin


Request Body: (sama seperti create, semua field optional)

#### Delete Bahan (Admin Only)
```
DELETE /bahan/{id}
```
**Required Role**: Admin

#### Update Stok Bahan (Admin Only)
```
POST /bahan/{id}/update-stok
```
**Required Role**: Admin


Request Body:
```json
{
  "jumlah": 50,
  "tipe": "tambah" // atau "kurang"
}
```

---

### 3. Manajemen Resep

#### Get All Resep (Admin & Staff)
```
GET /resep
```
**Required Role**: Admin, Staff


Query Parameters:
- `search` (optional): Cari berdasarkan nama resep
- `per_page` (optional): Jumlah data per halaman (default: 15)

#### Create Resep (Admin Only)
```
POST /resep
```
**Required Role**: Admin


Request Body:
```json
{
  "nama": "Nasi Goreng",
  "deskripsi": "Nasi goreng spesial",
  "cara_membuat": "1. Tumis bumbu...",
  "porsi": 4,
  "waktu_persiapan": 15,
  "waktu_memasak": 20,
  "bahan": [
    {
      "bahan_id": 1,
      "jumlah": 0.5,
      "satuan": "kg"
    },
    {
      "bahan_id": 2,
      "jumlah": 3,
      "satuan": "butir"
    }
  ]
}
```

#### Get Single Resep (Admin & Staff)
```
GET /resep/{id}
```
**Required Role**: Admin, Staff

#### Update Resep (Admin Only)
```
PUT /resep/{id}
```
**Required Role**: Admin


Request Body: (sama seperti create)

#### Delete Resep (Admin Only)
```
DELETE /resep/{id}
```
**Required Role**: Admin

#### Hitung Biaya Resep (Admin & Staff)
```
GET /resep/{id}/hitung-biaya
```
**Required Role**: Admin, Staff


Response:
```json
{
  "success": true,
  "message": "Estimasi biaya berhasil dihitung",
  "data": {
    "resep": "Nasi Goreng",
    "porsi": 4,
    "detail_biaya": [
      {
        "bahan": "Beras",
        "jumlah": 0.5,
        "satuan": "kg",
        "harga_per_satuan": 12000.00,
        "subtotal": 6000.00
      }
    ],
    "total_biaya": 6000.00,
    "biaya_per_porsi": 1500.00
  }
}
```

---

### 4. Manajemen Menu

#### Get All Menu (Admin & Staff)
```
GET /menu
```
**Required Role**: Admin, Staff


Query Parameters:
- `search` (optional): Cari berdasarkan nama menu
- `kategori` (optional): Filter berdasarkan kategori
- `tersedia` (optional): Filter berdasarkan ketersediaan (0/1)
- `per_page` (optional): Jumlah data per halaman (default: 15)

#### Create Menu (Admin Only)
```
POST /menu
Content-Type: multipart/form-data
```
**Required Role**: Admin


Request Body:
```
nama: "Paket Nasi Box A"
deskripsi: "Paket nasi box dengan lauk lengkap"
harga: 25000
kategori: "paket"
foto: [file]
tersedia: true
resep[0][resep_id]: 1
resep[0][jumlah_porsi]: 1
```

#### Get Single Menu (Admin & Staff)
```
GET /menu/{id}
```
**Required Role**: Admin, Staff

#### Update Menu (Admin Only)
```
POST /menu/{id}
Content-Type: multipart/form-data
```
**Required Role**: Admin


Request Body: (sama seperti create)

#### Delete Menu (Admin Only)
```
DELETE /menu/{id}
```
**Required Role**: Admin

#### Toggle Availability (Admin Only)
```
POST /menu/{id}/toggle-availability
```
**Required Role**: Admin

#### Get Kategori Menu (Admin & Staff)
```
GET /menu/kategori
```
**Required Role**: Admin, Staff

---

### 5. Manajemen Pelanggan

#### Get All Pelanggan (Admin & Staff)
```
GET /pelanggan
```
**Required Role**: Admin, Staff


Query Parameters:
- `search` (optional): Cari berdasarkan nama, email, atau telepon
- `per_page` (optional): Jumlah data per halaman (default: 15)

#### Create Pelanggan (Admin & Staff)
```
POST /pelanggan
```
**Required Role**: Admin, Staff


Request Body:
```json
{
  "nama": "John Doe",
  "email": "john@example.com",
  "telepon": "081234567890",
  "alamat": "Jl. Contoh No. 123"
}
```

#### Get Single Pelanggan (Admin & Staff)
```
GET /pelanggan/{id}
```
**Required Role**: Admin, Staff

#### Update Pelanggan (Admin & Staff)
```
PUT /pelanggan/{id}
```
**Required Role**: Admin, Staff

#### Delete Pelanggan (Admin & Staff)
```
DELETE /pelanggan/{id}
```
**Required Role**: Admin, Staff

---

### 6. Manajemen Order

#### Get All Orders (Admin & Staff)
```
GET /orders
```
**Required Role**: Admin, Staff


Query Parameters:
- `search` (optional): Cari berdasarkan nomor order atau nama pelanggan
- `status` (optional): Filter berdasarkan status
- `tanggal_mulai` & `tanggal_akhir` (optional): Filter berdasarkan tanggal acara
- `per_page` (optional): Jumlah data per halaman (default: 15)

Status yang tersedia:
- `pending`
- `dikonfirmasi`
- `diproses`
- `dikirim`
- `selesai`
- `dibatalkan`

#### Create Order (Admin & Staff)
```
POST /orders
```
**Required Role**: Admin, Staff


Request Body:
```json
{
  "pelanggan_id": 1,
  "tanggal_order": "2024-01-25",
  "tanggal_acara": "2024-01-30",
  "waktu_acara": "12:00",
  "alamat_pengiriman": "Jl. Acara No. 456",
  "jumlah_tamu": 100,
  "catatan": "Acara pernikahan",
  "items": [
    {
      "menu_id": 1,
      "jumlah": 100,
      "catatan": "Pedas sedang"
    },
    {
      "menu_id": 2,
      "jumlah": 100
    }
  ]
}
```

Response akan menghasilkan nomor order otomatis dengan format: `ORD-YYYYMMDD-XXXX`

#### Get Single Order (Admin & Staff)
```
GET /orders/{id}
```
**Required Role**: Admin, Staff

#### Update Order (Admin & Staff)
```
PUT /orders/{id}
```
**Required Role**: Admin, Staff


Request Body:
```json
{
  "tanggal_acara": "2024-01-30",
  "waktu_acara": "12:00",
  "alamat_pengiriman": "Jl. Acara No. 456",
  "jumlah_tamu": 100,
  "catatan": "Acara pernikahan"
}
```
Note: Tidak bisa update jika status sudah selesai atau dibatalkan

#### Delete Order (Admin & Staff)
```
DELETE /orders/{id}
```
**Required Role**: Admin, Staff

Note: Hanya bisa delete jika status masih pending

#### Update Status Order (Admin & Staff)
```
POST /orders/{id}/update-status
```
**Required Role**: Admin, Staff


Request Body:
```json
{
  "status": "dikonfirmasi"
}
```

Note: Ketika status diubah menjadi "diproses", sistem akan otomatis mengurangi stok bahan yang diperlukan berdasarkan resep dari menu yang dipesan.

#### Laporan Order (Admin Only)
```
GET /orders/laporan?tanggal_mulai=2024-01-01&tanggal_akhir=2024-01-31
```
**Required Role**: Admin


Response:
```json
{
  "success": true,
  "message": "Laporan order berhasil diambil",
  "data": {
    "periode": {
      "tanggal_mulai": "2024-01-01",
      "tanggal_akhir": "2024-01-31"
    },
    "ringkasan": {
      "total_order": 50,
      "total_pendapatan": 125000000.00,
      "status": {
        "pending": 5,
        "dikonfirmasi": 10,
        "diproses": 8,
        "dikirim": 7,
        "selesai": 15,
        "dibatalkan": 5
      }
    },
    "menu_terlaris": [
      {
        "menu_id": 1,
        "total_terjual": 500,
        "menu": {
          "id": 1,
          "nama": "Paket Nasi Box A",
          "harga": 25000.00
        }
      }
    ],
    "orders": []
  }
}
```

#### Download Invoice PDF (Admin & Staff)
```
GET /orders/{id}/invoice/download
```
**Required Role**: Admin, Staff

Download invoice order dalam format PDF. File akan otomatis terdownload dengan nama `Invoice_{nomor_order}.pdf`.

Response: Binary PDF file (auto download)

#### Bayar DP (Down Payment) (Admin & Staff)
```
POST /orders/{id}/pay-dp
```
**Required Role**: Admin, Staff

Request Body:
```json
{
  "dp_amount": 500000
}
```

Response:
```json
{
  "success": true,
  "message": "DP berhasil dibayar",
  "data": {
    "id": 1,
    "nomor_order": "ORD-20240125-0001",
    "total_harga": 1500000,
    "dp_amount": 500000,
    "dp_paid": true,
    "remaining_amount": 1000000,
    "paid_full": false,
    "payment_type": "dp",
    "dp_paid_at": "2024-01-25 10:30:00",
    "paid_full_at": null
  }
}
```

**Payment Type:**
- `tempo`: Belum ada pembayaran (tempo/hutang)
- `dp`: Sudah bayar DP
- `cash`: Sudah lunas (dibayar cash/tunai)

Note:
- DP amount tidak boleh melebihi total harga
- Tidak bisa bayar DP jika sudah pernah bayar DP atau sudah lunas

#### Bayar Pelunasan (Admin & Staff)
```
POST /orders/{id}/pay-full
```
**Required Role**: Admin, Staff

Response:
```json
{
  "success": true,
  "message": "Pembayaran lunas berhasil",
  "data": {
    "id": 1,
    "nomor_order": "ORD-20240125-0001",
    "total_harga": 1500000,
    "dp_amount": 500000,
    "dp_paid": true,
    "remaining_amount": 0,
    "paid_full": true,
    "payment_type": "cash",
    "dp_paid_at": "2024-01-25 10:30:00",
    "paid_full_at": "2024-01-26 14:00:00"
  }
}
```

Note:
- Jika belum bayar DP, endpoint ini akan langsung melunasi seluruh tagihan
- Jika sudah bayar DP, endpoint ini akan melunasi sisa pembayaran
- Tidak bisa bayar pelunasan jika sudah lunas

#### Riwayat Pembayaran (Admin & Staff)
```
GET /orders/{id}/payment-history
```
**Required Role**: Admin, Staff

Response:
```json
{
  "success": true,
  "message": "Riwayat pembayaran berhasil diambil",
  "data": {
    "order": {
      "nomor_order": "ORD-20240125-0001",
      "total_harga": 1500000,
      "payment_type": "cash",
      "payment_status": "Lunas",
      "dp_amount": 500000,
      "dp_paid": true,
      "paid_full": true,
      "total_paid": 1500000,
      "remaining_amount": 0
    },
    "history": [
      {
        "type": "DP",
        "amount": 500000,
        "paid_at": "2024-01-25 10:30:00"
      },
      {
        "type": "Pelunasan",
        "amount": 1000000,
        "paid_at": "2024-01-26 14:00:00"
      }
    ]
  }
}
```

#### Preview Invoice PDF (Public - Tanpa Auth)
```
GET /invoice/{token}
```
**Required Role**: Public (Tanpa Authentication)

Preview invoice order di browser menggunakan token unik. Token ini di-generate otomatis saat order dibuat dan bisa dibagikan ke pelanggan untuk melihat invoice mereka tanpa perlu login.

**URL Example:**
```
http://localhost/hw-katering/public/api/invoice/abc123def456ghi789jkl012mno345pq
```

**Token Format:**
- 32 karakter alfanumerik random
- Unik untuk setiap order
- Di-generate otomatis saat order dibuat

**Response:** PDF file stream (tampil di browser)

**Kegunaan:**
- Memudahkan pelanggan melihat invoice tanpa perlu akses ke sistem
- Bisa dibagikan via email/WhatsApp ke pelanggan
- Lebih aman karena tidak menggunakan ID order yang mudah ditebak

**Informasi Invoice:**
- Header perusahaan dengan logo dan kontak
- Informasi pelanggan lengkap
- Detail acara (tanggal, waktu, lokasi, jumlah tamu)
- Rincian menu yang dipesan dengan harga
- Total pembayaran
- Informasi pembayaran (DP, pelunasan, sisa)
- Status order dengan badge warna
- Catatan khusus (jika ada)
- Footer dengan informasi kontak

---

## Error Response Format

Semua error akan dikembalikan dalam format berikut:

```json
{
  "success": false,
  "message": "Pesan error",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (Token tidak valid atau tidak ada)
- `403` - Forbidden (Tidak memiliki permission)
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

## Flow Aplikasi

### 1. Authentication Flow
1. Admin membuat user baru: `POST /users` (Admin Only)
2. Login: `POST /login` (mendapat token)
3. Simpan token untuk digunakan di semua request berikutnya
4. Gunakan token di header: `Authorization: Bearer {token}`
5. Logout: `POST /logout`

### 2. Setup Awal (Admin Only)
1. Tambahkan bahan-bahan yang tersedia
2. Buat resep dengan komposisi bahan
3. Buat menu berdasarkan resep

### 3. Proses Order (Admin & Staff)
1. Tambahkan pelanggan (jika belum ada)
2. Buat order baru dengan status "pending"
3. Update status menjadi "dikonfirmasi" setelah konfirmasi
4. Update status menjadi "diproses" (sistem akan otomatis mengurangi stok bahan)
5. Update status menjadi "dikirim" saat pengiriman
6. Update status menjadi "selesai" setelah acara selesai

### 4. Monitoring
- Cek stok bahan yang rendah: `GET /bahan?stok_rendah=1` (Admin Only)
- Lihat laporan order: `GET /orders/laporan` (Admin Only)
- Hitung biaya produksi resep: `GET /resep/{id}/hitung-biaya` (Admin & Staff)

## Notes
- **Authentication**: Semua endpoint (kecuali `/login`) memerlukan authentication token
- **Authorization**: Aplikasi menggunakan role-based access control (RBAC) dengan 2 role: Admin dan Staff
- **User Registration**: User baru hanya bisa dibuat oleh Admin melalui `POST /users`, tidak ada public registration
- **Middleware**: Proteksi endpoint menggunakan:
  - `auth:sanctum` - Memastikan user sudah login
  - `role:admin` - Hanya admin yang bisa akses
  - `role:admin,staff` - Admin dan staff bisa akses
- **Hak Akses**:
  - Admin: Full access ke semua fitur termasuk user management
  - Staff: Akses terbatas, bisa kelola Menu (read), Resep (read), Pelanggan, dan Order
  - Staff tidak bisa akses Bahan, user management, dan tidak bisa create/update/delete Menu & Resep
- Semua endpoint pagination menggunakan Laravel's default pagination
- Upload foto menu maksimal 2MB, format: jpeg, png, jpg
- Nomor order akan di-generate otomatis dengan format: ORD-YYYYMMDD-XXXX
- Sistem akan otomatis validasi stok bahan saat order diproses
- Token authentication menggunakan Laravel Sanctum

## Permission Matrix

| Endpoint | Admin | Staff |
|----------|-------|-------|
| **Auth** | | |
| POST /login | ✅ | ✅ |
| POST /logout | ✅ | ✅ |
| GET /me | ✅ | ✅ |
| **Dashboard** | | |
| GET /dashboard | ✅ | ✅ |
| GET /dashboard/summary | ✅ | ✅ |
| GET /dashboard/charts | ✅ | ✅ |
| **Bahan** | | |
| GET /bahan | ✅ | ❌ |
| POST /bahan | ✅ | ❌ |
| GET /bahan/{id} | ✅ | ❌ |
| PUT /bahan/{id} | ✅ | ❌ |
| DELETE /bahan/{id} | ✅ | ❌ |
| POST /bahan/{id}/update-stok | ✅ | ❌ |
| **Resep** | | |
| GET /resep | ✅ | ✅ |
| POST /resep | ✅ | ❌ |
| GET /resep/{id} | ✅ | ✅ |
| PUT /resep/{id} | ✅ | ❌ |
| DELETE /resep/{id} | ✅ | ❌ |
| GET /resep/{id}/hitung-biaya | ✅ | ✅ |
| **Menu** | | |
| GET /menu | ✅ | ✅ |
| POST /menu | ✅ | ❌ |
| GET /menu/{id} | ✅ | ✅ |
| POST /menu/{id} | ✅ | ❌ |
| DELETE /menu/{id} | ✅ | ❌ |
| POST /menu/{id}/toggle-availability | ✅ | ❌ |
| GET /menu/kategori | ✅ | ✅ |
| **User** | | |
| GET /users | ✅ | ❌ |
| POST /users | ✅ | ❌ |
| GET /users/{id} | ✅ | ❌ |
| PUT /users/{id} | ✅ | ❌ |
| DELETE /users/{id} | ✅ | ❌ |
| **Pelanggan** | | |
| GET /pelanggan | ✅ | ✅ |
| POST /pelanggan | ✅ | ✅ |
| GET /pelanggan/{id} | ✅ | ✅ |
| PUT /pelanggan/{id} | ✅ | ✅ |
| DELETE /pelanggan/{id} | ✅ | ✅ |
| **Order** | | |
| GET /orders | ✅ | ✅ |
| POST /orders | ✅ | ✅ |
| GET /orders/{id} | ✅ | ✅ |
| PUT /orders/{id} | ✅ | ✅ |
| DELETE /orders/{id} | ✅ | ✅ |
| POST /orders/{id}/update-status | ✅ | ✅ |
| POST /orders/{id}/pay-dp | ✅ | ✅ |
| POST /orders/{id}/pay-full | ✅ | ✅ |
| GET /orders/laporan | ✅ | ❌ |
| GET /orders/{id}/invoice/download | ✅ | ✅ |
| GET /invoice/{token} | Public (No Auth) | Public (No Auth) |

---

**Last Updated**: 26 Januari 2026
