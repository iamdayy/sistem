<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bahan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BahanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Bahan::query();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nama', 'like', "%{$search}%");
        }


        $bahan = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'message' => 'Data bahan berhasil diambil',
            'data' => $bahan
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:255',
            'satuan' => 'required|string|max:50',
            'harga_per_satuan' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $bahan = Bahan::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Bahan berhasil ditambahkan',
            'data' => $bahan
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $bahan = Bahan::with('resep')->find($id);

        if (!$bahan) {
            return response()->json([
                'success' => false,
                'message' => 'Bahan tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data bahan berhasil diambil',
            'data' => $bahan
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $bahan = Bahan::find($id);

        if (!$bahan) {
            return response()->json([
                'success' => false,
                'message' => 'Bahan tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama' => 'sometimes|required|string|max:255',
            'satuan' => 'sometimes|required|string|max:50',
            'harga_per_satuan' => 'sometimes|required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $bahan->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Bahan berhasil diupdate',
            'data' => $bahan
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $bahan = Bahan::find($id);

        if (!$bahan) {
            return response()->json([
                'success' => false,
                'message' => 'Bahan tidak ditemukan'
            ], 404);
        }

        $bahan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bahan berhasil dihapus'
        ]);
    }
}
