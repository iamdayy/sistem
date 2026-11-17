<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_resep', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained('menu')->onDelete('cascade');
            $table->foreignId('resep_id')->constrained('resep')->onDelete('cascade');
            $table->integer('jumlah_porsi')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_resep');
    }
};
