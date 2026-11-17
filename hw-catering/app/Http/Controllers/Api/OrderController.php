<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Menu;
use App\Models\Bahan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Order::with(['pelanggan', 'orderDetail.menu']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nomor_order', 'like', "%{$search}%")
                  ->orWhereHas('pelanggan', function ($q2) use ($search) {
                      $q2->where('nama', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by tanggal
        if ($request->has('tanggal_mulai') && $request->has('tanggal_akhir')) {
            $query->whereBetween('tanggal_acara', [$request->tanggal_mulai, $request->tanggal_akhir]);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'message' => 'Data order berhasil diambil',
            'data' => $orders
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pelanggan_id' => 'required|exists:pelanggan,id',
            'tanggal_order' => 'required|date',
            'tanggal_acara' => 'required|date|after_or_equal:tanggal_order',
            'waktu_acara' => 'nullable|date_format:H:i',
            'alamat_pengiriman' => 'required|string',
            'jumlah_tamu' => 'required|integer|min:1',
            'catatan' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:menu,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.catatan' => 'nullable|string',
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
            // Hitung total harga
            $totalHarga = 0;
            foreach ($request->items as $item) {
                $menu = Menu::find($item['menu_id']);
                if (!$menu->tersedia) {
                    return response()->json([
                        'success' => false,
                        'message' => "Menu {$menu->nama} tidak tersedia"
                    ], 400);
                }
                $totalHarga += $menu->harga * $item['jumlah'];
            }

            // Buat order
            $order = Order::create([
                'pelanggan_id' => $request->pelanggan_id,
                'tanggal_order' => $request->tanggal_order,
                'tanggal_acara' => $request->tanggal_acara,
                'waktu_acara' => $request->waktu_acara,
                'alamat_pengiriman' => $request->alamat_pengiriman,
                'jumlah_tamu' => $request->jumlah_tamu,
                'total_harga' => $totalHarga,
                'payment_type' => 'tempo', // default tempo (belum bayar)
                'dp_amount' => 0,
                'dp_paid' => false,
                'remaining_amount' => $totalHarga,
                'paid_full' => false,
                'status' => 'pending',
                'catatan' => $request->catatan,
            ]);

            // Buat order detail
            foreach ($request->items as $item) {
                $menu = Menu::find($item['menu_id']);
                $subtotal = $menu->harga * $item['jumlah'];

                OrderDetail::create([
                    'order_id' => $order->id,
                    'menu_id' => $item['menu_id'],
                    'jumlah' => $item['jumlah'],
                    'harga_satuan' => $menu->harga,
                    'subtotal' => $subtotal,
                    'catatan' => $item['catatan'] ?? null,
                ]);
            }

            DB::commit();

            $order->load(['pelanggan', 'orderDetail.menu']);

            return response()->json([
                'success' => true,
                'message' => 'Order berhasil dibuat',
                'data' => $order
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $order = Order::with(['pelanggan', 'orderDetail.menu'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data order berhasil diambil',
            'data' => $order
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan'
            ], 404);
        }

        // Jangan izinkan update jika sudah selesai atau dibatalkan
        if (in_array($order->status, ['selesai', 'dibatalkan'])) {
            return response()->json([
                'success' => false,
                'message' => 'Order sudah selesai atau dibatalkan, tidak dapat diupdate'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'tanggal_acara' => 'sometimes|required|date',
            'waktu_acara' => 'nullable|date_format:H:i',
            'alamat_pengiriman' => 'sometimes|required|string',
            'jumlah_tamu' => 'sometimes|required|integer|min:1',
            'catatan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $order->update($request->only([
            'tanggal_acara',
            'waktu_acara',
            'alamat_pengiriman',
            'jumlah_tamu',
            'catatan',
        ]));

        $order->load(['pelanggan', 'orderDetail.menu']);

        return response()->json([
            'success' => true,
            'message' => 'Order berhasil diupdate',
            'data' => $order
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan'
            ], 404);
        }

        // Hanya izinkan delete jika status pending
        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya order dengan status pending yang dapat dihapus'
            ], 400);
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order berhasil dihapus'
        ]);
    }

    /**
     * Update status order
     */
    public function updateStatus(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,dikonfirmasi,diproses,dikirim,selesai,dibatalkan',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        
 $order->status = $request->status;
            $order->save();
        $order->load(['pelanggan', 'orderDetail.menu']);

        return response()->json([
            'success' => true,
            'message' => 'Status order berhasil diupdate',
            'data' => $order
        ]);
    }

    /**
     * Get laporan order berdasarkan periode
     */
    public function laporan(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tanggal_mulai' => 'required|date',
            'tanggal_akhir' => 'required|date|after_or_equal:tanggal_mulai',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $orders = Order::whereBetween('tanggal_acara', [$request->tanggal_mulai, $request->tanggal_akhir])
            ->with(['pelanggan', 'orderDetail.menu'])
            ->get();

        $totalOrder = $orders->count();
        $totalPendapatan = $orders->whereIn('status', ['selesai'])->sum('total_harga');
        $totalPending = $orders->where('status', 'pending')->count();
        $totalDikonfirmasi = $orders->where('status', 'dikonfirmasi')->count();
        $totalDiproses = $orders->where('status', 'diproses')->count();
        $totalDikirim = $orders->where('status', 'dikirim')->count();
        $totalSelesai = $orders->where('status', 'selesai')->count();
        $totalDibatalkan = $orders->where('status', 'dibatalkan')->count();

        // Menu terlaris
        $menuTerlaris = OrderDetail::whereHas('order', function ($q) use ($request) {
                $q->whereBetween('tanggal_acara', [$request->tanggal_mulai, $request->tanggal_akhir])
                  ->where('status', 'selesai');
            })
            ->select('menu_id', DB::raw('SUM(jumlah) as total_terjual'))
            ->groupBy('menu_id')
            ->orderBy('total_terjual', 'desc')
            ->with('menu')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Laporan order berhasil diambil',
            'data' => [
                'periode' => [
                    'tanggal_mulai' => $request->tanggal_mulai,
                    'tanggal_akhir' => $request->tanggal_akhir,
                ],
                'ringkasan' => [
                    'total_order' => $totalOrder,
                    'total_pendapatan' => $totalPendapatan,
                    'status' => [
                        'pending' => $totalPending,
                        'dikonfirmasi' => $totalDikonfirmasi,
                        'diproses' => $totalDiproses,
                        'dikirim' => $totalDikirim,
                        'selesai' => $totalSelesai,
                        'dibatalkan' => $totalDibatalkan,
                    ]
                ],
                'menu_terlaris' => $menuTerlaris,
                'orders' => $orders,
            ]
        ]);
    }

    /**
     * Generate Invoice PDF untuk order
     */
    public function generateInvoice($id)
    {
        $order = Order::with(['pelanggan', 'orderDetail.menu'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan'
            ], 404);
        }

        // Generate PDF
        $pdf = Pdf::loadView('pdf.invoice', compact('order'));

        // Set paper size dan orientation
        $pdf->setPaper('a4', 'portrait');

        // Download PDF dengan nama file
        $filename = 'Invoice_' . $order->nomor_order . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Preview Invoice PDF di browser menggunakan token unik
     */
    public function previewInvoice($token)
    {
        $order = Order::where('invoice_token', $token)->with(['pelanggan', 'orderDetail.menu'])->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice tidak ditemukan'
            ], 404);
        }

        // Generate PDF
        $pdf = Pdf::loadView('pdf.invoice', compact('order'));

        // Set paper size dan orientation
        $pdf->setPaper('a4', 'portrait');

        // Stream PDF (preview di browser)
        return $pdf->stream('Invoice_' . $order->nomor_order . '.pdf');
    }

    /**
     * Bayar DP (Down Payment)
     */
    public function payDP(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan'
            ], 404);
        }

        // Cek apakah DP sudah dibayar
        if ($order->payment_type == 'dp' || $order->payment_type == 'cash') {
            return response()->json([
                'success' => false,
                'message' => 'DP sudah dibayar atau order sudah lunas'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'dp_amount' => 'required|numeric|min:0|max:' . $order->total_harga,
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
            $dpAmount = $request->dp_amount;

            $order->dp_amount = $dpAmount;
            $order->dp_paid = true; // boolean flag
            $order->remaining_amount = $order->total_harga - $dpAmount;
            $order->payment_type = 'dp';
            $order->dp_paid_at = now();
            $order->save();

            DB::commit();

            $order->load(['pelanggan', 'orderDetail.menu']);

            return response()->json([
                'success' => true,
                'message' => 'DP berhasil dibayar',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses pembayaran DP: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bayar Pelunasan
     */
    public function payFull($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan'
            ], 404);
        }

        // Cek apakah sudah lunas
        if ($order->payment_type == 'cash') {
            return response()->json([
                'success' => false,
                'message' => 'Order sudah lunas'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Jika belum ada DP, langsung bayar full
            if ($order->payment_type == 'tempo') {
                $order->dp_amount = $order->total_harga;
                $order->dp_paid = true;
                $order->paid_full = true;
                $order->remaining_amount = 0;
                $order->payment_type = 'cash';
                $order->dp_paid_at = now();
                $order->paid_full_at = now();
            }
            // Jika sudah DP, bayar sisa
            else if ($order->payment_type == 'dp') {
                $order->paid_full = true;
                $order->remaining_amount = 0;
                $order->payment_type = 'cash';
                $order->paid_full_at = now();
            }

            $order->save();

            DB::commit();

            $order->load(['pelanggan', 'orderDetail.menu']);

            return response()->json([
                'success' => true,
                'message' => 'Pembayaran lunas berhasil',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses pelunasan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment history
     */
    public function paymentHistory($id)
    {
        $order = Order::with(['pelanggan'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan'
            ], 404);
        }

        $history = [];
        $totalPaid = 0;

        if ($order->dp_paid_at && $order->dp_paid) {
            $history[] = [
                'type' => 'DP',
                'amount' => $order->dp_amount,
                'paid_at' => $order->dp_paid_at,
            ];
            $totalPaid += $order->dp_amount;
        }

        if ($order->paid_full_at && $order->paid_full) {
            $sisaPembayaran = $order->total_harga - $order->dp_amount;
            $history[] = [
                'type' => 'Pelunasan',
                'amount' => $sisaPembayaran,
                'paid_at' => $order->paid_full_at,
            ];
            $totalPaid = $order->total_harga;
        }

        // Mapping payment_type ke status yang lebih user friendly
        $paymentStatus = [
            'tempo' => 'Belum Bayar',
            'dp' => 'DP',
            'cash' => 'Lunas'
        ];

        return response()->json([
            'success' => true,
            'message' => 'Riwayat pembayaran berhasil diambil',
            'data' => [
                'order' => [
                    'nomor_order' => $order->nomor_order,
                    'total_harga' => $order->total_harga,
                    'payment_type' => $order->payment_type,
                    'payment_status' => $paymentStatus[$order->payment_type] ?? $order->payment_type,
                    'dp_amount' => $order->dp_amount,
                    'dp_paid' => $order->dp_paid,
                    'paid_full' => $order->paid_full,
                    'total_paid' => $totalPaid,
                    'remaining_amount' => $order->remaining_amount,
                ],
                'history' => $history
            ]
        ]);
    }

    public function hitungRincianBelanja($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan'
            ], 404);
        }

        $rincianBelanja = [];
        $totalBelanja = 0;

        foreach ($order->orderDetail as $detail) {
            $menu = $detail->menu;
            foreach ($menu->resep as $resep) {
                foreach ($resep->bahan as $bahan) {
                    $jumlahDibutuhkan = $bahan->pivot->jumlah * $resep->pivot->jumlah_porsi * $detail->jumlah;
                    $totalBelanja += $jumlahDibutuhkan * $bahan->harga_per_satuan;
                    $rincianBelanja[] = [
                        'nama' => $bahan->nama,
                        'jumlah' => $jumlahDibutuhkan,
                        'satuan' => $bahan->satuan,
                        'harga' => $bahan->harga_per_satuan,
                        'subtotal' => $jumlahDibutuhkan * $bahan->harga_per_satuan,
                    ];
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Rincian belanja berhasil dihitung',
            'data' => [
                'order' => [
                    'nomor_order' => $order->nomor_order,
                    'total_harga' => $order->total_harga,
                ],
                'rincian_belanja' => $rincianBelanja,
                'total_belanja' => $totalBelanja,
            ]
        ]);
    }

    /**
     * Generate PDF Rincian Belanja
     */
    public function generateRincianBelanjaPDF($id)
    {
        $order = Order::with(['pelanggan', 'orderDetail.menu.resep.bahan'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan'
            ], 404);
        }

        $rincianBelanja = [];
        $totalBelanja = 0;

        foreach ($order->orderDetail as $detail) {
            $menu = $detail->menu;
            foreach ($menu->resep as $resep) {
                foreach ($resep->bahan as $bahan) {
                    $jumlahDibutuhkan = $bahan->pivot->jumlah * $resep->pivot->jumlah_porsi * $detail->jumlah;
                    $totalBelanja += $jumlahDibutuhkan * $bahan->harga_per_satuan;
                    $rincianBelanja[] = [
                        'nama' => $bahan->nama,
                        'jumlah' => $jumlahDibutuhkan,
                        'satuan' => $bahan->satuan,
                        'harga' => $bahan->harga_per_satuan,
                        'subtotal' => $jumlahDibutuhkan * $bahan->harga_per_satuan,
                    ];
                }
            }
        }

        // Data array untuk view
        $data = [
            'order' => [
                'nomor_order' => $order->nomor_order,
                'total_harga' => $order->total_harga,
            ],
            'rincian_belanja' => $rincianBelanja,
            'total_belanja' => $totalBelanja,
        ];

        // Generate PDF
        $pdf = Pdf::loadView('pdf.rincian_belanja', $data);

        // Set paper size dan orientation
        $pdf->setPaper('a4', 'portrait');

        // Download PDF dengan nama file
        $filename = 'Rincian_Belanja_' . $order->nomor_order . '.pdf';

        return $pdf->download($filename);
    }
}
