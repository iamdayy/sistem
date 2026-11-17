<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Resep;
use App\Models\Bahan;

class ResepSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Resep Tumpeng Standar (10 Porsi)
        $tumpengStandar = Resep::create([
            'nama' => 'Tumpeng Standar',
            'deskripsi' => 'Resep Tumpeng untuk 10 porsi dengan nasi kuning/liwet lengkap dengan lauk',
            'cara_membuat' => '1. Cuci beras dan masak dengan santan menjadi nasi kuning
2. Goreng ayam dengan bumbu sampai matang
3. Rebus telur hingga matang
4. Tumis mie dengan bumbu
5. Goreng tempe atau buat urap
6. Potong selada dan timun untuk lalapan
7. Buat sambal dari cabe, bawang, tomat
8. Susun nasi berbentuk tumpeng dan hias dengan lauk',
            'porsi' => 10,
            'waktu_persiapan' => 30,
            'waktu_memasak' => 60,
        ]);

        // Attach bahan ke resep dengan pivot data (jumlah per 10 porsi)
        $tumpengStandar->bahan()->attach([
            Bahan::where('nama', 'Beras')->first()->id => ['jumlah' => 1, 'satuan' => 'kg'],
            Bahan::where('nama', 'Kelapa Parut')->first()->id => ['jumlah' => 1, 'satuan' => 'butir'],
            Bahan::where('nama', 'Ayam Potong')->first()->id => ['jumlah' => 1, 'satuan' => 'kg'],
            Bahan::where('nama', 'Telur')->first()->id => ['jumlah' => 1, 'satuan' => 'kg'],
            Bahan::where('nama', 'Tempe')->first()->id => ['jumlah' => 1, 'satuan' => 'papan'],
            Bahan::where('nama', 'Mie Basah')->first()->id => ['jumlah' => 0.5, 'satuan' => 'kg'],
            Bahan::where('nama', 'Selada')->first()->id => ['jumlah' => 1, 'satuan' => 'bungkus'],
            Bahan::where('nama', 'Timun')->first()->id => ['jumlah' => 0.5, 'satuan' => 'kg'],
            Bahan::where('nama', 'Bawang Merah')->first()->id => ['jumlah' => 0.25, 'satuan' => 'kg'],
            Bahan::where('nama', 'Bawang Putih')->first()->id => ['jumlah' => 0.15, 'satuan' => 'kg'],
            Bahan::where('nama', 'Cabe Rawit Merah')->first()->id => ['jumlah' => 0.1, 'satuan' => 'kg'],
            Bahan::where('nama', 'Cabe Merah Besar')->first()->id => ['jumlah' => 0.1, 'satuan' => 'kg'],
            Bahan::where('nama', 'Tomat')->first()->id => ['jumlah' => 0.25, 'satuan' => 'kg'],
            Bahan::where('nama', 'Minyak Goreng')->first()->id => ['jumlah' => 0.5, 'satuan' => 'liter'],
        ]);

        // Resep Nasi Box Standar (1 Porsi)
        $nasiBoxStandar = Resep::create([
            'nama' => 'Nasi Box Standar',
            'deskripsi' => 'Resep nasi box dengan ayam dan 1 menu pendamping',
            'cara_membuat' => '1. Masak nasi kuning/uduk/liwet
2. Goreng atau bakar ayam dengan bumbu
3. Buat menu pendamping (mie/bihun/urap/sambal goreng kentang)
4. Buat sambal
5. Siapkan lalapan (timun, selada)
6. Kemas dalam box',
            'porsi' => 1,
            'waktu_persiapan' => 15,
            'waktu_memasak' => 30,
        ]);

        $nasiBoxStandar->bahan()->attach([
            Bahan::where('nama', 'Beras')->first()->id => ['jumlah' => 0.15, 'satuan' => 'kg'],
            Bahan::where('nama', 'Kelapa Parut')->first()->id => ['jumlah' => 0.1, 'satuan' => 'butir'],
            Bahan::where('nama', 'Ayam Potong')->first()->id => ['jumlah' => 0.15, 'satuan' => 'kg'],
            Bahan::where('nama', 'Mie Basah')->first()->id => ['jumlah' => 0.08, 'satuan' => 'kg'],
            Bahan::where('nama', 'Timun')->first()->id => ['jumlah' => 0.05, 'satuan' => 'kg'],
            Bahan::where('nama', 'Selada')->first()->id => ['jumlah' => 0.1, 'satuan' => 'bungkus'],
            Bahan::where('nama', 'Bawang Merah')->first()->id => ['jumlah' => 0.03, 'satuan' => 'kg'],
            Bahan::where('nama', 'Bawang Putih')->first()->id => ['jumlah' => 0.02, 'satuan' => 'kg'],
            Bahan::where('nama', 'Cabe Rawit Merah')->first()->id => ['jumlah' => 0.01, 'satuan' => 'kg'],
            Bahan::where('nama', 'Tomat')->first()->id => ['jumlah' => 0.03, 'satuan' => 'kg'],
            Bahan::where('nama', 'Minyak Goreng')->first()->id => ['jumlah' => 0.05, 'satuan' => 'liter'],
        ]);

        // Resep Nasi Box Hemat (1 Porsi)
        $nasiBoxHemat = Resep::create([
            'nama' => 'Nasi Box Hemat',
            'deskripsi' => 'Resep nasi box hemat dengan telur dan 1 menu pendamping',
            'cara_membuat' => '1. Masak nasi kuning/uduk/liwet
2. Buat telur (rebus/dadar/ceplok/bali)
3. Buat menu pendamping (mie/urap/tempe)
4. Buat sambal
5. Siapkan lalapan
6. Kemas dalam box',
            'porsi' => 1,
            'waktu_persiapan' => 10,
            'waktu_memasak' => 20,
        ]);

        $nasiBoxHemat->bahan()->attach([
            Bahan::where('nama', 'Beras')->first()->id => ['jumlah' => 0.15, 'satuan' => 'kg'],
            Bahan::where('nama', 'Kelapa Parut')->first()->id => ['jumlah' => 0.08, 'satuan' => 'butir'],
            Bahan::where('nama', 'Telur')->first()->id => ['jumlah' => 0.1, 'satuan' => 'kg'],
            Bahan::where('nama', 'Mie Basah')->first()->id => ['jumlah' => 0.08, 'satuan' => 'kg'],
            Bahan::where('nama', 'Tempe')->first()->id => ['jumlah' => 0.3, 'satuan' => 'papan'],
            Bahan::where('nama', 'Timun')->first()->id => ['jumlah' => 0.05, 'satuan' => 'kg'],
            Bahan::where('nama', 'Bawang Merah')->first()->id => ['jumlah' => 0.02, 'satuan' => 'kg'],
            Bahan::where('nama', 'Bawang Putih')->first()->id => ['jumlah' => 0.015, 'satuan' => 'kg'],
            Bahan::where('nama', 'Cabe Rawit Merah')->first()->id => ['jumlah' => 0.01, 'satuan' => 'kg'],
            Bahan::where('nama', 'Tomat')->first()->id => ['jumlah' => 0.02, 'satuan' => 'kg'],
            Bahan::where('nama', 'Minyak Goreng')->first()->id => ['jumlah' => 0.04, 'satuan' => 'liter'],
        ]);

        // Resep Nasi Box Spesial (1 Porsi)
        $nasiBoxSpesial = Resep::create([
            'nama' => 'Nasi Box Spesial',
            'deskripsi' => 'Resep nasi box spesial dengan ayam dan 2 menu pendamping',
            'cara_membuat' => '1. Masak nasi kuning/uduk/liwet
2. Bakar/goreng/rendang ayam dengan bumbu spesial
3. Buat 2 menu pendamping (mie+urap atau bihun+sambal goreng kentang)
4. Buat sambal
5. Siapkan lalapan
6. Kemas dalam box',
            'porsi' => 1,
            'waktu_persiapan' => 20,
            'waktu_memasak' => 40,
        ]);

        $nasiBoxSpesial->bahan()->attach([
            Bahan::where('nama', 'Beras')->first()->id => ['jumlah' => 0.18, 'satuan' => 'kg'],
            Bahan::where('nama', 'Kelapa Parut')->first()->id => ['jumlah' => 0.12, 'satuan' => 'butir'],
            Bahan::where('nama', 'Ayam Potong')->first()->id => ['jumlah' => 0.18, 'satuan' => 'kg'],
            Bahan::where('nama', 'Mie Basah')->first()->id => ['jumlah' => 0.08, 'satuan' => 'kg'],
            Bahan::where('nama', 'Kentang')->first()->id => ['jumlah' => 0.1, 'satuan' => 'kg'],
            Bahan::where('nama', 'Tempe')->first()->id => ['jumlah' => 0.3, 'satuan' => 'papan'],
            Bahan::where('nama', 'Timun')->first()->id => ['jumlah' => 0.05, 'satuan' => 'kg'],
            Bahan::where('nama', 'Selada')->first()->id => ['jumlah' => 0.1, 'satuan' => 'bungkus'],
            Bahan::where('nama', 'Bawang Merah')->first()->id => ['jumlah' => 0.04, 'satuan' => 'kg'],
            Bahan::where('nama', 'Bawang Putih')->first()->id => ['jumlah' => 0.03, 'satuan' => 'kg'],
            Bahan::where('nama', 'Cabe Rawit Merah')->first()->id => ['jumlah' => 0.015, 'satuan' => 'kg'],
            Bahan::where('nama', 'Cabe Merah Besar')->first()->id => ['jumlah' => 0.01, 'satuan' => 'kg'],
            Bahan::where('nama', 'Tomat')->first()->id => ['jumlah' => 0.04, 'satuan' => 'kg'],
            Bahan::where('nama', 'Minyak Goreng')->first()->id => ['jumlah' => 0.06, 'satuan' => 'liter'],
        ]);

        // Resep Paket Komplit (1 Porsi)
        $paketKomplit = Resep::create([
            'nama' => 'Paket Komplit',
            'deskripsi' => 'Resep paket lengkap dengan ayam, telur, 2 menu pendamping, kerupuk, dan air mineral',
            'cara_membuat' => '1. Masak nasi kuning/uduk/liwet
2. Goreng ayam dengan bumbu
3. Buat telur (rebus/dadar/ceplok)
4. Buat 2 menu pendamping
5. Buat sambal
6. Siapkan lalapan dan kerupuk
7. Sertakan air mineral
8. Kemas dalam box',
            'porsi' => 1,
            'waktu_persiapan' => 25,
            'waktu_memasak' => 45,
        ]);

        $paketKomplit->bahan()->attach([
            Bahan::where('nama', 'Beras')->first()->id => ['jumlah' => 0.2, 'satuan' => 'kg'],
            Bahan::where('nama', 'Kelapa Parut')->first()->id => ['jumlah' => 0.15, 'satuan' => 'butir'],
            Bahan::where('nama', 'Ayam Potong')->first()->id => ['jumlah' => 0.15, 'satuan' => 'kg'],
            Bahan::where('nama', 'Telur')->first()->id => ['jumlah' => 0.1, 'satuan' => 'kg'],
            Bahan::where('nama', 'Mie Basah')->first()->id => ['jumlah' => 0.08, 'satuan' => 'kg'],
            Bahan::where('nama', 'Kentang')->first()->id => ['jumlah' => 0.1, 'satuan' => 'kg'],
            Bahan::where('nama', 'Tempe')->first()->id => ['jumlah' => 0.3, 'satuan' => 'papan'],
            Bahan::where('nama', 'Timun')->first()->id => ['jumlah' => 0.06, 'satuan' => 'kg'],
            Bahan::where('nama', 'Selada')->first()->id => ['jumlah' => 0.15, 'satuan' => 'bungkus'],
            Bahan::where('nama', 'Bawang Merah')->first()->id => ['jumlah' => 0.04, 'satuan' => 'kg'],
            Bahan::where('nama', 'Bawang Putih')->first()->id => ['jumlah' => 0.03, 'satuan' => 'kg'],
            Bahan::where('nama', 'Cabe Rawit Merah')->first()->id => ['jumlah' => 0.015, 'satuan' => 'kg'],
            Bahan::where('nama', 'Cabe Merah Besar')->first()->id => ['jumlah' => 0.01, 'satuan' => 'kg'],
            Bahan::where('nama', 'Tomat')->first()->id => ['jumlah' => 0.04, 'satuan' => 'kg'],
            Bahan::where('nama', 'Minyak Goreng')->first()->id => ['jumlah' => 0.07, 'satuan' => 'liter'],
        ]);

        // Resep Add-on Daging Sapi (1 Porsi)
        $addonDaging = Resep::create([
            'nama' => 'Add-on Daging Sapi',
            'deskripsi' => 'Tambahan lauk daging sapi untuk paket nasi box',
            'cara_membuat' => '1. Potong daging sapi sesuai ukuran
2. Bumbui dengan bumbu rendang atau semur
3. Masak hingga empuk dan bumbu meresap
4. Sajikan sebagai lauk tambahan',
            'porsi' => 1,
            'waktu_persiapan' => 10,
            'waktu_memasak' => 60,
        ]);

        $addonDaging->bahan()->attach([
            Bahan::where('nama', 'Daging Sapi')->first()->id => ['jumlah' => 0.1, 'satuan' => 'kg'],
            Bahan::where('nama', 'Bawang Merah')->first()->id => ['jumlah' => 0.02, 'satuan' => 'kg'],
            Bahan::where('nama', 'Bawang Putih')->first()->id => ['jumlah' => 0.015, 'satuan' => 'kg'],
            Bahan::where('nama', 'Cabe Merah Besar')->first()->id => ['jumlah' => 0.01, 'satuan' => 'kg'],
            Bahan::where('nama', 'Tomat')->first()->id => ['jumlah' => 0.02, 'satuan' => 'kg'],
            Bahan::where('nama', 'Minyak Goreng')->first()->id => ['jumlah' => 0.03, 'satuan' => 'liter'],
        ]);
    }
}
