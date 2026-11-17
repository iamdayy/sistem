<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Menu;
use App\Models\Resep;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Menu Nasi Kuning Hemat
        $nasiKuningHemat = Menu::create([
            'nama' => 'Nasi Kuning Hemat',
            'deskripsi' => 'Nasi (Kuning/Uduk/Liwet), Telur (Rebus/Dadar/Ceplok/Bali), 1 Menu Pendamping, Sambal, Lalapan.',
            'harga' => 10000,
            'kategori' => 'Nasi Box',
            'tersedia' => true,
        ]);

        // Hubungkan dengan resep
        $resepHemat = Resep::where('nama', 'Nasi Box Hemat')->first();
        if ($resepHemat) {
            $nasiKuningHemat->resep()->attach($resepHemat->id, ['jumlah_porsi' => 1]);
        }

        // Menu Nasi Kuning Standar
        $nasiKuningStandar = Menu::create([
            'nama' => 'Nasi Kuning Standar',
            'deskripsi' => 'Nasi (Kuning/Uduk/Liwet), Lauk Ayam, 1 Menu Pendamping (Mie/Urap/Bihun/Sambal Grg Kentang), Sambal, Lalapan.',
            'harga' => 15000,
            'kategori' => 'Nasi Box',
            'tersedia' => true,
        ]);

        $resepStandar = Resep::where('nama', 'Nasi Box Standar')->first();
        if ($resepStandar) {
            $nasiKuningStandar->resep()->attach($resepStandar->id, ['jumlah_porsi' => 1]);
        }

        // Menu Nasi Kuning Spesial
        $nasiKuningSpesial = Menu::create([
            'nama' => 'Nasi Kuning Spesial',
            'deskripsi' => 'Nasi (Kuning/Uduk/Liwet), Ayam (Bakar/Goreng/Rendang/Semur), 2 Menu Pendamping, Sambal, Lalapan.',
            'harga' => 17000,
            'kategori' => 'Nasi Box',
            'tersedia' => true,
        ]);

        $resepSpesial = Resep::where('nama', 'Nasi Box Spesial')->first();
        if ($resepSpesial) {
            $nasiKuningSpesial->resep()->attach($resepSpesial->id, ['jumlah_porsi' => 1]);
        }

        // Menu Paket Komplit
        $paketKomplit = Menu::create([
            'nama' => 'Paket Komplit',
            'deskripsi' => 'Nasi (Kuning/Uduk/Liwet), Ayam + Telur, 2 Menu Pendamping, Sambal, Lalapan, Kerupuk, Air Mineral.',
            'harga' => 20000,
            'kategori' => 'Nasi Box',
            'tersedia' => true,
        ]);

        $resepPaketKomplit = Resep::where('nama', 'Paket Komplit')->first();
        if ($resepPaketKomplit) {
            $paketKomplit->resep()->attach($resepPaketKomplit->id, ['jumlah_porsi' => 1]);
        }

        // Menu Tumpeng Mini (5 Porsi)
        $tumpengMini = Menu::create([
            'nama' => 'Tumpeng Mini (5 Porsi)',
            'deskripsi' => 'Nasi Kuning/Liwet, Telur (Dadar Iris/Puyuh/Pindang), Ayam (Bakar/Goreng/Suwir), Mie/Bihun, Oreg Tempe/Urap, Sambal, Lalapan Garnish.',
            'harga' => 150000,
            'kategori' => 'Tumpeng',
            'tersedia' => true,
        ]);

        $resepTumpeng = Resep::where('nama', 'Tumpeng Standar')->first();
        if ($resepTumpeng) {
            // Untuk 5 porsi, gunakan 0.5x dari resep 10 porsi
            $tumpengMini->resep()->attach($resepTumpeng->id, ['jumlah_porsi' => 0.5]);
        }

        // Menu Tumpeng Standar (10 Porsi)
        $tumpengStandar = Menu::create([
            'nama' => 'Tumpeng Standar (10 Porsi)',
            'deskripsi' => 'Nasi Kuning/Liwet, Telur (Dadar Iris/Puyuh/Pindang), Ayam (Bakar/Goreng/Suwir), Mie/Bihun, Oreg Tempe/Urap, Sambal, Lalapan Garnish. Menu sama dengan paket 5 porsi, porsi dilipatgandakan.',
            'harga' => 300000,
            'kategori' => 'Tumpeng',
            'tersedia' => true,
        ]);

        if ($resepTumpeng) {
            // Untuk 10 porsi, gunakan 1x resep (sesuai resep asli)
            $tumpengStandar->resep()->attach($resepTumpeng->id, ['jumlah_porsi' => 1]);
        }

        // Menu Add-on Daging
        $addonDaging = Menu::create([
            'nama' => 'Add-on Daging Sapi',
            'deskripsi' => 'Tambahan lauk Daging Sapi untuk paket nasi box.',
            'harga' => 10000,
            'kategori' => 'Tambahan',
            'tersedia' => true,
        ]);

        $resepAddon = Resep::where('nama', 'Add-on Daging Sapi')->first();
        if ($resepAddon) {
            $addonDaging->resep()->attach($resepAddon->id, ['jumlah_porsi' => 1]);
        }
    }
}
