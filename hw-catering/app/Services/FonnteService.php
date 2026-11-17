<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FonnteService
{
    /**
     * Send WhatsApp message via Fonnte
     *
     * @param string $target Comma separated phone numbers
     * @param string $message Message content
     * @return array
     */
    public function send($target, $message)
    {
        try {
            $token = env('FONNTE_TOKEN');

            if (empty($token)) {
                Log::error('Fonnte token not found in .env');
                return [
                    'status' => false,
                    'message' => 'Fonnte token belum dikonfigurasi'
                ];
            }

            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->post('https://api.fonnte.com/send', [
                'target' => $target,
                'message' => $message,
                'countryCode' => '62', // Default country code to Indonesia
            ]);

            $result = $response->json();

            Log::info('Fonnte Response:', ['target' => $target, 'response' => $result]);

            return [
                'status' => $result['status'] ?? false,
                'detail' => $result['detail'] ?? null,
                'message' => $result['reason'] ?? 'Request sent',
            ];

        } catch (\Exception $e) {
            Log::error('Fonnte Error: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Gagal mengirim pesan: ' . $e->getMessage()
            ];
        }
    }
}
