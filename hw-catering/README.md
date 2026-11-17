# HW Katering - API Documentation

Sistem manajemen katering berbasis Laravel untuk mengelola bahan, resep, menu, pesanan, dan pelanggan.

## Requirements

- PHP >= 8.1
- Composer
- MySQL/MariaDB
- XAMPP atau web server lainnya

## Instalasi

### 1. Clone atau Download Project
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/
# Atau download dan extract ke folder htdocs
```

### 2. Install Dependencies
```bash
cd hw-katering
composer install
```

### 3. Setup Environment
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Konfigurasi Database
Edit file `.env` dan sesuaikan konfigurasi database:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hw_katering
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Buat Database
Buat database baru di phpMyAdmin atau MySQL:
```sql
CREATE DATABASE hw_katering;
```

### 6. Jalankan Migration
```bash
php artisan migrate
```

### 7. Jalankan Seeder (Opsional)
Untuk mengisi data awal user admin dan staff:
```bash
php artisan db:seed --class=UserSeeder
```

User yang dibuat:
- **Admin**:
  - Email: `admin@katering.com`
  - Password: `password`
  - Role: `admin`

- **Staff**:
  - Email: `staff@katering.com`
  - Password: `password`
  - Role: `staff`

### 8. Jalankan Server
```bash
php artisan serve
```

Aplikasi akan berjalan di `http://localhost:8000`

## API Endpoints

Dokumentasi lengkap API tersedia di file `API_DOCUMENTATION.md`

### Base URL
```
http://localhost:8000/api
```

### Authentication
API menggunakan Laravel Sanctum untuk autentikasi. Setelah login, gunakan token yang diberikan di header:
```
Authorization: Bearer {your-token}
```

### Endpoint Utama

#### Authentication
- `POST /register` - Registrasi user baru
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /user` - Get user yang sedang login

#### Dashboard
- `GET /dashboard` - Data dashboard lengkap
- `GET /dashboard/summary` - Ringkasan dashboard

#### Bahan
- `GET /bahan` - List semua bahan
- `POST /bahan` - Tambah bahan baru
- `GET /bahan/{id}` - Detail bahan
- `PUT /bahan/{id}` - Update bahan
- `DELETE /bahan/{id}` - Hapus bahan

#### Resep
- `GET /resep` - List semua resep
- `POST /resep` - Tambah resep baru
- `GET /resep/{id}` - Detail resep
- `PUT /resep/{id}` - Update resep
- `DELETE /resep/{id}` - Hapus resep

#### Menu
- `GET /menu` - List semua menu
- `POST /menu` - Tambah menu baru
- `GET /menu/{id}` - Detail menu
- `PUT /menu/{id}` - Update menu
- `DELETE /menu/{id}` - Hapus menu

#### Pelanggan
- `GET /pelanggan` - List semua pelanggan
- `POST /pelanggan` - Tambah pelanggan baru
- `GET /pelanggan/{id}` - Detail pelanggan
- `PUT /pelanggan/{id}` - Update pelanggan
- `DELETE /pelanggan/{id}` - Hapus pelanggan

#### Order
- `GET /order` - List semua order
- `POST /order` - Buat order baru
- `GET /order/{id}` - Detail order
- `PUT /order/{id}` - Update order
- `PATCH /order/{id}/status` - Update status order
- `DELETE /order/{id}` - Hapus order

## Testing API

Gunakan tools seperti:
- Postman
- Insomnia
- Thunder Client (VS Code Extension)

Import collection dari `API_DOCUMENTATION.md` untuk testing yang lebih mudah.

## Troubleshooting

### Error: "SQLSTATE[HY000] [1045] Access denied"
- Pastikan kredensial database di `.env` sudah benar
- Pastikan MySQL service di XAMPP sudah running

### Error: "No application encryption key"
- Jalankan: `php artisan key:generate`

### Error: Migration failed
- Pastikan database sudah dibuat
- Cek koneksi database di `.env`
- Jalankan: `php artisan migrate:fresh` (hati-hati, ini akan menghapus semua data)

### Port 8000 sudah digunakan
```bash
php artisan serve --port=8001
```

## License

MIT License
