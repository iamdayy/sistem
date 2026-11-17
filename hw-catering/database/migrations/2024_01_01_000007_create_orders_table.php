<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_order')->unique();
            $table->string('invoice_token')->unique();
            $table->foreignId('pelanggan_id')->constrained('pelanggan')->onDelete('cascade');
            $table->date('tanggal_order');
            $table->date('tanggal_acara');
            $table->time('waktu_acara')->nullable();
            $table->text('alamat_pengiriman');
            $table->integer('jumlah_tamu');
            $table->decimal('total_harga', 12, 2);
            
            // Payment Details
            $table->string('payment_type');
            $table->decimal('dp_amount', 12, 2)->default(0);
            $table->boolean('dp_paid')->default(false);
            $table->timestamp('dp_paid_at')->nullable();
            $table->decimal('remaining_amount', 12, 2)->default(0);
            $table->boolean('paid_full')->default(false);
            $table->timestamp('paid_full_at')->nullable();
            $table->date('payment_due_date')->nullable();

            $table->enum('status', ['pending', 'dikonfirmasi', 'diproses', 'dikirim', 'selesai', 'dibatalkan'])->default('pending');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
