<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pelanggan;
use App\Services\FonnteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BroadcastController extends Controller
{
    protected $fonnteService;

    public function __construct(FonnteService $fonnteService)
    {
        $this->fonnteService = $fonnteService;
    }

    /**
     * Send broadcast message
     */
    public function send(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string',
            'target_pelanggan_ids' => 'nullable|array',
            'target_pelanggan_ids.*' => 'exists:pelanggan,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $message = $request->message;
        $targetIds = $request->target_pelanggan_ids;

        // Fetch phone numbers
        $query = Pelanggan::query()->whereNotNull('telepon')->where('telepon', '!=', '');

        if (!empty($targetIds)) {
            $query->whereIn('id', $targetIds);
        }

        $pelanggan = $query->get();

        if ($pelanggan->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada pelanggan aktif dengan nomor telepon yang ditemukan'
            ], 404);
        }

        // Collect and format phone numbers
        $phones = [];
        foreach ($pelanggan as $p) {
            // Basic sanitization: remove non-numeric except +
            $phone = preg_replace('/[^0-9]/', '', $p->telepon);
            
            // Fix 08xxx to 628xxx for Fonnte (optional, Fonnte has countryCode param but good to be explicit)
            if (str_starts_with($phone, '08')) {
                $phone = '62' . substr($phone, 1);
            }

            if (!empty($phone)) {
                $phones[] = $phone;
            }
        }

        if (empty($phones)) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada nomor telepon valid yang ditemukan'
            ], 404);
        }

        // Fonnte accepts comma separated numbers
        $target = implode(',', array_unique($phones));

        // Send via Service
        $result = $this->fonnteService->send($target, $message);

        if ($result['status']) {
            return response()->json([
                'success' => true,
                'message' => 'Broadcast berhasil dikirim (antrian Fonnte)',
                'detail' => [
                    'total_targets' => count(array_unique($phones)),
                    'targets' => array_unique($phones), // Optional: might be too long to return
                    'fonnte_response' => $result
                ]
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim broadcast',
                'error' => $result
            ], 500);
        }
    }
}
