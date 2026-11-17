<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resep extends Model
{
    use HasFactory;

    protected $table = 'resep';

    protected $fillable = [
        'nama',
        'deskripsi',
        'cara_membuat',
        'porsi',
        'waktu_persiapan',
        'waktu_memasak',
    ];

    protected $casts = [
        'porsi' => 'integer',
        'waktu_persiapan' => 'integer',
        'waktu_memasak' => 'integer',
    ];

    public function bahan()
    {
        return $this->belongsToMany(Bahan::class, 'resep_bahan')
            ->withPivot('jumlah', 'satuan')
            ->withTimestamps();
    }

    public function menu()
    {
        return $this->belongsToMany(Menu::class, 'menu_resep')
            ->withPivot('jumlah_porsi')
            ->withTimestamps();
    }
}
