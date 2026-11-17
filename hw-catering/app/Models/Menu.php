<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasFactory;

    protected $table = 'menu';

    protected $fillable = [
        'nama',
        'deskripsi',
        'harga',
        'kategori',
        'foto',
        'tersedia',
    ];

    protected $casts = [
        'harga' => 'decimal:2',
        'tersedia' => 'boolean',
    ];

    public function resep()
    {
        return $this->belongsToMany(Resep::class, 'menu_resep')
            ->withPivot('jumlah_porsi')
            ->withTimestamps();
    }

    public function orderDetail()
    {
        return $this->hasMany(OrderDetail::class);
    }
}
