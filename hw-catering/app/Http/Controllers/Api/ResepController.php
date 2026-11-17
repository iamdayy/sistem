<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resep;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ResepController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Resep::with('bahan');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nama', 'like', "%{$search}%");
        }

        $resep = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'message' => 'Data resep berhasil diambil',
            'data' => $resep
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'cara_membuat' => 'nullable|string',
            'porsi' => 'required|integer|min:1',
            'waktu_persiapan' => 'nullable|integer|min:0',
            'waktu_memasak' => 'nullable|integer|min:0',
            'bahan' => 'nullable|array',
            'bahan.*.bahan_id' => 'required|exists:bahan,id',
            'bahan.*.jumlah' => 'required|numeric|min:0',
            'bahan.*.satuan' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $resep = Resep::create([
                'nama' => $request->nama,
                'deskripsi' => $request->deskripsi,
                'cara_membuat' => $request->cara_membuat,
                'porsi' => $request->porsi,
                'waktu_persiapan' => $request->waktu_persiapan,
                'waktu_memasak' => $request->waktu_memasak,
            ]);

            // Attach bahan
            if ($request->has('bahan')) {
                foreach ($request->bahan as $bahan) {
                    $resep->bahan()->attach($bahan['bahan_id'], [
                        'jumlah' => $bahan['jumlah'],
                        'satuan' => $bahan['satuan'],
                    ]);
                }
            }

            DB::commit();

            $resep->load('bahan');

            return response()->json([
                'success' => true,
                'message' => 'Resep berhasil ditambahkan',
                'data' => $resep
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan resep: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $resep = Resep::with('bahan', 'menu')->find($id);

        if (!$resep) {
            return response()->json([
                'success' => false,
                'message' => 'Resep tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data resep berhasil diambil',
            'data' => $resep
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $resep = Resep::find($id);

        if (!$resep) {
            return response()->json([
                'success' => false,
                'message' => 'Resep tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama' => 'sometimes|required|string|max:255',
            'deskripsi' => 'nullable|string',
            'cara_membuat' => 'nullable|string',
            'porsi' => 'sometimes|required|integer|min:1',
            'waktu_persiapan' => 'nullable|integer|min:0',
            'waktu_memasak' => 'nullable|integer|min:0',
            'bahan' => 'nullable|array',
            'bahan.*.bahan_id' => 'required|exists:bahan,id',
            'bahan.*.jumlah' => 'required|numeric|min:0',
            'bahan.*.satuan' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $resep->update($request->only([
                'nama',
                'deskripsi',
                'cara_membuat',
                'porsi',
                'waktu_persiapan',
                'waktu_memasak',
            ]));

            // Update bahan
            if ($request->has('bahan')) {
                $resep->bahan()->detach();
                foreach ($request->bahan as $bahan) {
                    $resep->bahan()->attach($bahan['bahan_id'], [
                        'jumlah' => $bahan['jumlah'],
                        'satuan' => $bahan['satuan'],
                    ]);
                }
            }

            DB::commit();

            $resep->load('bahan');

            return response()->json([
                'success' => true,
                'message' => 'Resep berhasil diupdate',
                'data' => $resep
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate resep: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $resep = Resep::find($id);

        if (!$resep) {
            return response()->json([
                'success' => false,
                'message' => 'Resep tidak ditemukan'
            ], 404);
        }

        $resep->delete();

        return response()->json([
            'success' => true,
            'message' => 'Resep berhasil dihapus'
        ]);
    }

    /**
     * Hitung estimasi biaya resep
     */
    public function hitungBiaya($id)
    {
        $resep = Resep::with('bahan')->find($id);

        if (!$resep) {
            return response()->json([
                'success' => false,
                'message' => 'Resep tidak ditemukan'
            ], 404);
        }

        $totalBiaya = 0;
        $detailBiaya = [];

        foreach ($resep->bahan as $bahan) {
            $biaya = $bahan->pivot->jumlah * $bahan->harga_per_satuan;
            $totalBiaya += $biaya;
            $detailBiaya[] = [
                'bahan' => $bahan->nama,
                'jumlah' => $bahan->pivot->jumlah,
                'satuan' => $bahan->pivot->satuan,
                'harga_per_satuan' => $bahan->harga_per_satuan,
                'subtotal' => $biaya,
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Estimasi biaya berhasil dihitung',
            'data' => [
                'resep' => $resep->nama,
                'porsi' => $resep->porsi,
                'detail_biaya' => $detailBiaya,
                'total_biaya' => $totalBiaya,
                'biaya_per_porsi' => $totalBiaya / $resep->porsi,
            ]
        ]);
    }
}
