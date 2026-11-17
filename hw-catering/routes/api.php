<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BahanController;
use App\Http\Controllers\Api\ResepController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\PelangganController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\BroadcastController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Auth Routes (Public)
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes (Require Authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard Routes (Admin and Staff)
    Route::prefix('dashboard')->middleware('role:admin,staff')->group(function () {
        Route::get('/', [DashboardController::class, 'index']);
        Route::get('/summary', [DashboardController::class, 'summary']);
        Route::get('/charts', [DashboardController::class, 'charts']);
    });
});

// User Management Routes (Admin Only)
Route::prefix('users')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::post('/', [UserController::class, 'store']);
    Route::get('/{id}', [UserController::class, 'show']);
    Route::put('/{id}', [UserController::class, 'update']);
    Route::delete('/{id}', [UserController::class, 'destroy']);
});

// Bahan Routes (Admin Only)
Route::prefix('bahan')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/', [BahanController::class, 'index']);
    Route::post('/', [BahanController::class, 'store']);
    Route::get('/{id}', [BahanController::class, 'show']);
    Route::put('/{id}', [BahanController::class, 'update']);
    Route::delete('/{id}', [BahanController::class, 'destroy']);
});

// Resep Routes (Admin can do all, Staff can only read)
Route::prefix('resep')->middleware('auth:sanctum')->group(function () {
    // Read access for Admin & Staff
    Route::get('/', [ResepController::class, 'index'])->middleware('role:admin,staff');
    Route::get('/{id}', [ResepController::class, 'show'])->middleware('role:admin,staff');
    Route::get('/{id}/hitung-biaya', [ResepController::class, 'hitungBiaya'])->middleware('role:admin,staff');

    // Write access for Admin only
    Route::post('/', [ResepController::class, 'store'])->middleware('role:admin');
    Route::put('/{id}', [ResepController::class, 'update'])->middleware('role:admin');
    Route::delete('/{id}', [ResepController::class, 'destroy'])->middleware('role:admin');
});
Route::get('menu/', [MenuController::class, 'index']);
// Menu Routes (Admin can do all, Staff can only read)
Route::prefix('menu')->middleware('auth:sanctum')->group(function () {
    
    Route::get('/kategori', [MenuController::class, 'byKategori']);
    Route::get('/{id}', [MenuController::class, 'show']);

    // Admin only
    Route::middleware('role:admin')->group(function () {
        Route::post('/', [MenuController::class, 'store']);
        Route::post('/{id}', [MenuController::class, 'update']); // POST untuk support file upload
        Route::delete('/{id}', [MenuController::class, 'destroy']);
        Route::post('/{id}/toggle-availability', [MenuController::class, 'toggleAvailability']);
    });
});

// Pelanggan Routes (Admin and Staff)
Route::prefix('pelanggan')->middleware(['auth:sanctum', 'role:admin,staff'])->group(function () {
    Route::get('/', [PelangganController::class, 'index']);
    Route::post('/', [PelangganController::class, 'store']);
    Route::get('/{id}', [PelangganController::class, 'show']);
    Route::put('/{id}', [PelangganController::class, 'update']);
    Route::delete('/{id}', [PelangganController::class, 'destroy']);
});

// Order Routes (Admin and Staff)
Route::prefix('orders')->middleware(['auth:sanctum', 'role:admin,staff'])->group(function () {
    Route::get('/', [OrderController::class, 'index']);
    Route::post('/', [OrderController::class, 'store']);

    // Laporan - Admin only
    Route::get('/laporan', [OrderController::class, 'laporan'])->middleware('role:admin');

    Route::get('/{id}', [OrderController::class, 'show']);
    Route::put('/{id}', [OrderController::class, 'update']);
    Route::delete('/{id}', [OrderController::class, 'destroy']);
    Route::post('/{id}/update-status', [OrderController::class, 'updateStatus']);
    Route::get('/{id}/rincian-belanja', [OrderController::class, 'hitungRincianBelanja']);

    // Payment Routes
    Route::post('/{id}/pay-dp', [OrderController::class, 'payDP']);
    Route::post('/{id}/pay-full', [OrderController::class, 'payFull']);
    Route::get('/{id}/payment-history', [OrderController::class, 'paymentHistory']);

    // Invoice PDF (Download - dengan auth)
    Route::get('/{id}/invoice/download', [OrderController::class, 'generateInvoice']);
    // Rincian Belanja PDF (Download - dengan auth)
    Route::get('/{id}/rincian-belanja/download', [OrderController::class, 'generateRincianBelanjaPDF']);
});

// Invoice Preview (Public - tanpa auth, pakai token unik)
Route::get('/invoice/{token}', [OrderController::class, 'previewInvoice']);

// Broadcast Routes (Admin Only)
Route::prefix('broadcast')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('/send', [BroadcastController::class, 'send']);
});
