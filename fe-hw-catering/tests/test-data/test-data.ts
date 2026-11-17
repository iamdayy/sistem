/**
 * test-data.ts
 *
 * Centralized, deterministic test data used across black box tests.
 *
 * Data values are chosen to exercise valid (positive) and invalid (negative)
 * input partitions. Numeric boundary values are derived from the backend
 * validation rules observed in the Laravel controllers (e.g. harga min:0,
 * jumlah_tamu min:1, password min:8, telepon max:20).
 */
import type { ApiClient } from '../helpers/api-client';
import type { TestUser } from '../fixtures/auth.fixture';

export const APP = {
  baseURL: process.env.APP_BASE_URL || 'http://localhost:3000',
  apiBase: process.env.API_BASE_URL || 'http://127.0.0.1:8000/api',
  routes: {
    login: '/login',
    dashboard: '/dashboard',
    menu: '/menu',
    bahan: '/bahan',
    resep: '/resep',
    pelanggan: '/pelanggan',
    order: '/order',
    users: '/users',
    laporan: '/laporan',
    broadcast: '/broadcast',
  },
} as const;

/**
 * Valid (positive) test data.
 */
export const VALID = {
  pelanggan: {
    nama: 'Pelanggan Uji',
    email: 'pelanggan.uji@example.com',
    telepon: '081234567890',
    alamat: 'Jl. Contoh No. 1, Kota',
  },
  pelangganUpdate: {
    nama: 'Pelanggan Uji Diperbarui',
    email: 'pelanggan.uji.update@example.com',
    telepon: '081234567891',
    alamat: 'Jl. Contoh Baru No. 2, Kota',
  },
  bahan: {
    nama: 'Bahan Uji',
    satuan: 'kg',
    harga_per_satuan: 15000,
  },
  bahanUpdate: {
    nama: 'Bahan Uji Diperbarui',
    satuan: 'pcs',
    harga_per_satuan: 20000,
  },
  resep: {
    nama: 'Resep Uji',
    deskripsi: 'Deskripsi resep uji',
    cara_membuat: 'Campur semua bahan, masak hingga matang.',
    porsi: 4,
    waktu_persiapan: 15,
    waktu_memasak: 30,
  },
  menu: {
    nama: 'Menu Uji',
    deskripsi: 'Deskripsi menu uji',
    harga: 25000,
    kategori: 'Makanan Utama',
    tersedia: true,
  },
  menuUpdate: {
    nama: 'Menu Uji Diperbarui',
    deskripsi: 'Deskripsi diperbarui',
    harga: 30000,
    kategori: 'Makanan Ringan',
    tersedia: false,
  },
  order: {
    tanggal_acara: '2026-12-20',
    waktu_acara: '12:00',
    alamat_pengiriman: 'Jl. Acara No. 1, Kota',
    jumlah_tamu: 50,
    catatan: 'Catatan order uji',
  },
} as const;

/**
 * Invalid (negative) test data.
 */
export const INVALID = {
  pelangganMissingNama: { email: 'x@example.com', telepon: '081234567890', alamat: 'Jl. X' },
  pelangganInvalidEmail: { nama: 'X', email: 'not-an-email', telepon: '081234567890', alamat: 'Jl. X' },
  pelangganTeleponTooLong: { nama: 'X', email: 'x@example.com', telepon: '08123456789012345678901', alamat: 'Jl. X' },
  bahanMissingNama: { satuan: 'kg', harga_per_satuan: 10000 },
  bahanNegativeHarga: { nama: 'Bahan', satuan: 'kg', harga_per_satuan: -1000 },
  menuMissingNama: { deskripsi: 'x', harga: 10000, kategori: 'Makanan', tersedia: true },
  menuNegativeHarga: { nama: 'Menu', deskripsi: 'x', harga: -5000, kategori: 'Makanan', tersedia: true },
  orderMissingItems: { pelanggan_id: 1, tanggal_acara: '2026-12-20', waktu_acara: '12:00', alamat_pengiriman: 'Jl. X', jumlah_tamu: 10, items: [] },
  orderPastEventDate: '2020-01-01',
  orderZeroGuests: 0,
  loginWrongPassword: 'salah123',
  loginMissingEmail: '',
} as const;

/**
 * Boundary values.
 */
export const BOUNDARY = {
  passwordMin: 'abcd1234', // exactly 8 chars
  passwordBelowMin: 'abc123', // 6 chars
  hargaZero: 0,
  jumlahTamuMin: 1,
  jumlahTamuZero: 0,
} as const;

/**
 * Generate a unique customer payload to avoid unique-email collisions across
 * repeated test runs.
 */
export function uniquePelanggan(suffix = Date.now().toString()) {
  return {
    nama: `Pelanggan ${suffix}`,
    email: `pelanggan.${suffix}@example.com`,
    telepon: `0812345678${suffix.slice(-4)}`,
    alamat: 'Jl. Uji No. 1, Kota',
  };
}

/**
 * Create a fresh staff user via the API (admin token required on `api`) and
 * return its login credentials. Used for staff authorization tests because the
 * seeded `staff@katering.com` account does not authenticate reliably in this
 * environment (see QA_ANALYSIS.md).
 */
export async function createStaffUser(api: ApiClient): Promise<TestUser> {
  const email = `staff.${Date.now()}@example.com`;
  const password = 'StaffPass123';
  await api.post('/users', {
    name: 'Staff Uji',
    email,
    password,
    role: 'staff',
  });
  return { email, password, role: 'staff' };
}

/** Unique bahan payload to avoid unique-name collisions across runs. */
export function uniqueBahan(suffix = Date.now().toString()) {
  return {
    nama: `Bahan ${suffix}`,
    satuan: 'kg',
    harga_per_satuan: 10000,
  };
}

/** Unique menu payload to avoid unique-name collisions across runs. */
export function uniqueMenu(suffix = Date.now().toString()) {
  return {
    nama: `Menu ${suffix}`,
    deskripsi: 'Deskripsi menu unik',
    harga: 25000,
    kategori: 'Kategori Uji',
    tersedia: true,
  };
}

export type PelangganPayload = typeof VALID.pelanggan;
export type BahanPayload = typeof VALID.bahan;
export type MenuPayload = typeof VALID.menu;
export type OrderPayload = typeof VALID.order;

export { USERS } from '../fixtures/auth.fixture';
export type { TestUser };
