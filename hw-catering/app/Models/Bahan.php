<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bahan extends Model
{
    use HasFactory;

    protected $table = 'bahan';

    protected $fillable = [
        'nama',
        'satuan',
        'harga_per_satuan',
    ];

    protected $casts = [
        'harga_per_satuan' => 'decimal:2',
    ];

    public function resep()
    {
        return $this->belongsToMany(Resep::class, 'resep_bahan')
            ->withPivot('jumlah', 'satuan')
            ->withTimestamps();
    }
}
