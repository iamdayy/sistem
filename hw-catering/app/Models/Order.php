<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    protected $fillable = [
        'nomor_order',
        'invoice_token',
        'pelanggan_id',
        'tanggal_order',
        'tanggal_acara',
        'waktu_acara',
        'alamat_pengiriman',
        'jumlah_tamu',
        'total_harga',
        'payment_type',
        'dp_amount',
        'dp_paid',
        'dp_paid_at',
        'paid_full',
        'paid_full_at',
        'payment_due_date',
        'remaining_amount',
        'status',
        'catatan',
    ];

    protected $casts = [
        'tanggal_order' => 'date',
        'tanggal_acara' => 'date',
        'total_harga' => 'decimal:2',
        'dp_amount' => 'decimal:2',
        'dp_paid' => 'boolean',
        'remaining_amount' => 'decimal:2',
        'paid_full' => 'boolean',
        'jumlah_tamu' => 'integer',
        'dp_paid_at' => 'datetime',
        'paid_full_at' => 'datetime',
        'payment_due_date' => 'date',
    ];

    public function pelanggan()
    {
        return $this->belongsTo(Pelanggan::class);
    }

    public function orderDetail()
    {
        return $this->hasMany(OrderDetail::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->nomor_order)) {
                $order->nomor_order = 'ORD-' . date('Ymd') . '-' . str_pad(static::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);
            }

            // Generate invoice token unik
            if (empty($order->invoice_token)) {
                $order->invoice_token = Str::random(32);
            }
        });
    }
}
