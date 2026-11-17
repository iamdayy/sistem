<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MenuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Menu::with('resep');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nama', 'like', "%{$search}%");
        }

        // Filter by kategori
        if ($request->has('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        // Filter by availability
        if ($request->has('tersedia')) {
            $query->where('tersedia', $request->tersedia);
        }

        $menu = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'message' => 'Data menu berhasil diambil',
            'data' => $menu
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
            'harga' => 'required|numeric|min:0',
            'kategori' => 'nullable|string|max:100',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'tersedia' => 'boolean',
            'resep' => 'nullable|array',
            'resep.*.resep_id' => 'required|exists:resep,id',
            'resep.*.jumlah_porsi' => 'required|integer|min:1',
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
            $data = $request->only(['nama', 'deskripsi', 'harga', 'kategori', 'tersedia']);

            // Handle foto upload
            if ($request->hasFile('foto')) {
                $file = $request->file('foto');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('menu', $filename, 'public');
                $data['foto'] = $path;
            }

            $menu = Menu::create($data);

            // Attach resep
            if ($request->has('resep')) {
                foreach ($request->resep as $resep) {
                    $menu->resep()->attach($resep['resep_id'], [
                        'jumlah_porsi' => $resep['jumlah_porsi'],
                    ]);
                }
            }

            DB::commit();

            $menu->load('resep');

            return response()->json([
                'success' => true,
                'message' => 'Menu berhasil ditambahkan',
                'data' => $menu
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan menu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $menu = Menu::with(['resep.bahan'])->find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Menu tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data menu berhasil diambil',
            'data' => $menu
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $menu = Menu::find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Menu tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama' => 'sometimes|required|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga' => 'sometimes|required|numeric|min:0',
            'kategori' => 'nullable|string|max:100',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'tersedia' => 'boolean',
            'resep' => 'nullable|array',
            'resep.*.resep_id' => 'required|exists:resep,id',
            'resep.*.jumlah_porsi' => 'required|integer|min:1',
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
            $data = $request->only(['nama', 'deskripsi', 'harga', 'kategori', 'tersedia']);

            // Handle foto upload
            if ($request->hasFile('foto')) {
                // Delete old foto
                if ($menu->foto && Storage::disk('public')->exists($menu->foto)) {
                    Storage::disk('public')->delete($menu->foto);
                }

                $file = $request->file('foto');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('menu', $filename, 'public');
                $data['foto'] = $path;
            }

            $menu->update($data);

            // Update resep
            if ($request->has('resep')) {
                $menu->resep()->detach();
                foreach ($request->resep as $resep) {
                    $menu->resep()->attach($resep['resep_id'], [
                        'jumlah_porsi' => $resep['jumlah_porsi'],
                    ]);
                }
            }

            DB::commit();

            $menu->load('resep');

            return response()->json([
                'success' => true,
                'message' => 'Menu berhasil diupdate',
                'data' => $menu
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate menu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $menu = Menu::find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Menu tidak ditemukan'
            ], 404);
        }

        // Delete foto
        if ($menu->foto && Storage::disk('public')->exists($menu->foto)) {
            Storage::disk('public')->delete($menu->foto);
        }

        $menu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil dihapus'
        ]);
    }

    /**
     * Toggle availability
     */
    public function toggleAvailability($id)
    {
        $menu = Menu::find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Menu tidak ditemukan'
            ], 404);
        }

        $menu->tersedia = !$menu->tersedia;
        $menu->save();

        return response()->json([
            'success' => true,
            'message' => 'Status ketersediaan menu berhasil diupdate',
            'data' => $menu
        ]);
    }

    /**
     * Get menu by kategori
     */
    public function byKategori(Request $request)
    {
        $kategori = Menu::select('kategori')
            ->distinct()
            ->whereNotNull('kategori')
            ->orderBy('kategori')
            ->pluck('kategori');

        return response()->json([
            'success' => true,
            'message' => 'Kategori menu berhasil diambil',
            'data' => $kategori
        ]);
    }
}
