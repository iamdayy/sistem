<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Bahan;

class BahanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bahan = [
            [
                'nama' => 'Beras',
                'satuan' => 'kg',
                'harga_per_satuan' => 15000,
            ],
            [
                'nama' => 'Minyak Goreng',
                'satuan' => 'liter',
                'harga_per_satuan' => 20000,
            ],
            [
                'nama' => 'Ayam Potong',
                'satuan' => 'kg',
                'harga_per_satuan' => 40000,
            ],
            [
                'nama' => 'Daging Sapi',
                'satuan' => 'kg',
                'harga_per_satuan' => 130000,
            ],
            [
                'nama' => 'Telur',
                'satuan' => 'kg',
                'harga_per_satuan' => 28000,
            ],
            [
                'nama' => 'Bawang Merah',
                'satuan' => 'kg',
                'harga_per_satuan' => 30000,
            ],
            [
                'nama' => 'Bawang Putih',
                'satuan' => 'kg',
                'harga_per_satuan' => 40000,
            ],
            [
                'nama' => 'Cabe Rawit Merah',
                'satuan' => 'kg',
                'harga_per_satuan' => 35000,
            ],
            [
                'nama' => 'Cabe Merah Besar',
                'satuan' => 'kg',
                'harga_per_satuan' => 25000,
            ],
            [
                'nama' => 'Tomat',
                'satuan' => 'kg',
                'harga_per_satuan' => 10000,
            ],
            [
                'nama' => 'Wortel',
                'satuan' => 'kg',
                'harga_per_satuan' => 10000,
            ],
            [
                'nama' => 'Kentang',
                'satuan' => 'kg',
                'harga_per_satuan' => 12000,
            ],
            [
                'nama' => 'Mie Basah',
                'satuan' => 'kg',
                'harga_per_satuan' => 12000,
            ],
            [
                'nama' => 'Tempe',
                'satuan' => 'papan',
                'harga_per_satuan' => 5000,
            ],
            [
                'nama' => 'Kelapa Parut',
                'satuan' => 'butir',
                'harga_per_satuan' => 14000,
            ],
            [
                'nama' => 'Timun',
                'satuan' => 'kg',
                'harga_per_satuan' => 8000,
            ],
            [
                'nama' => 'Selada',
                'satuan' => 'bungkus',
                'harga_per_satuan' => 6000,
            ],
            [
                'nama' => 'Kol/Kobis',
                'satuan' => 'kg',
                'harga_per_satuan' => 8000,
            ],
            [
                'nama' => 'Daun Bawang',
                'satuan' => 'kg',
                'harga_per_satuan' => 8000,
            ],
        ];

        foreach ($bahan as $item) {
            Bahan::create($item);
        }
    }
}
