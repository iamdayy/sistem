<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Bahan;
use App\Models\Resep;
use App\Models\Menu;
use App\Models\Pelanggan;
use App\Models\Order;
use App\Models\OrderDetail;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function index(Request $request)
    {
        // Periode default: 30 hari terakhir
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

        // 1. Total Data Master
        $totalBahan = Bahan::count();
        $totalResep = Resep::count();
        $totalMenu = Menu::count();
        $totalPelanggan = Pelanggan::count();

        // 2. Statistik Order (dalam periode)
        $ordersInPeriod = Order::whereBetween('tanggal_order', [$startDate, $endDate]);
        $totalOrders = $ordersInPeriod->count();

        // Total pendapatan (hanya dari order yang selesai)
        $totalRevenue = Order::whereBetween('tanggal_order', [$startDate, $endDate])
            ->where('status', 'selesai')
            ->sum('total_harga');

        // Order berdasarkan status
        $ordersByStatus = Order::whereBetween('tanggal_order', [$startDate, $endDate])
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->status => $item->total];
            });


        // 4. Menu terlaris (dalam periode)
        $menuTerlaris = OrderDetail::whereHas('order', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('tanggal_order', [$startDate, $endDate])
                  ->where('status', 'selesai');
            })
            ->select('menu_id', DB::raw('SUM(jumlah) as total_terjual'), DB::raw('SUM(subtotal) as total_pendapatan'))
            ->groupBy('menu_id')
            ->orderBy('total_terjual', 'desc')
            ->with('menu:id,nama,harga,kategori')
            ->limit(10)
            ->get();

        // 5. Pendapatan per hari (7 hari terakhir)
        $revenuePerDay = Order::where('status', 'selesai')
            ->whereBetween('tanggal_order', [Carbon::now()->subDays(7)->format('Y-m-d'), $endDate])
            ->select(
                DB::raw('DATE(tanggal_order) as tanggal'),
                DB::raw('COUNT(*) as total_order'),
                DB::raw('SUM(total_harga) as total_pendapatan')
            )
            ->groupBy('tanggal')
            ->orderBy('tanggal', 'asc')
            ->get();

        // 6. Order terbaru (5 terakhir)
        $recentOrders = Order::with(['pelanggan:id,nama', 'orderDetail'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // 7. Statistik pelanggan
        $pelangganBaru = Pelanggan::whereBetween('created_at', [$startDate, $endDate])->count();

        // Top 5 pelanggan (berdasarkan jumlah order selesai)
        $topPelanggan = Pelanggan::withCount(['orders' => function ($q) {
                $q->where('status', 'selesai');
            }])
            ->withSum(['orders' => function ($q) {
                $q->where('status', 'selesai');
            }], 'total_harga')
            ->having('orders_count', '>', 0)
            ->orderBy('orders_count', 'desc')
            ->limit(5)
            ->get();

        // 8. Kategori menu terlaris
        $kategoriTerlaris = OrderDetail::whereHas('order', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('tanggal_order', [$startDate, $endDate])
                  ->where('status', 'selesai');
            })
            ->join('menu', 'order_detail.menu_id', '=', 'menu.id')
            ->select('menu.kategori', DB::raw('SUM(order_detail.jumlah) as total_terjual'))
            ->groupBy('menu.kategori')
            ->orderBy('total_terjual', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data dashboard berhasil diambil',
            'data' => [
                'periode' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
                'total_data' => [
                    'bahan' => $totalBahan,
                    'resep' => $totalResep,
                    'menu' => $totalMenu,
                    'pelanggan' => $totalPelanggan,
                ],
                'order_statistics' => [
                    'total_orders' => $totalOrders,
                    'total_revenue' => $totalRevenue,
                    'by_status' => [
                        'pending' => $ordersByStatus['pending'] ?? 0,
                        'dikonfirmasi' => $ordersByStatus['dikonfirmasi'] ?? 0,
                        'diproses' => $ordersByStatus['diproses'] ?? 0,
                        'dikirim' => $ordersByStatus['dikirim'] ?? 0,
                        'selesai' => $ordersByStatus['selesai'] ?? 0,
                        'dibatalkan' => $ordersByStatus['dibatalkan'] ?? 0,
                    ],
                ],
                'menu_terlaris' => $menuTerlaris,
                'revenue_per_day' => $revenuePerDay,
                'recent_orders' => $recentOrders,
                'customer_statistics' => [
                    'pelanggan_baru' => $pelangganBaru,
                    'top_pelanggan' => $topPelanggan,
                ],
                'kategori_terlaris' => $kategoriTerlaris,
            ]
        ]);
    }

    /**
     * Get ringkasan singkat untuk widget dashboard
     */
    public function summary()
    {
        // Data hari ini
        $today = Carbon::now()->format('Y-m-d');

        // Order hari ini
        $ordersToday = Order::whereDate('tanggal_order', $today)->count();

        // Pendapatan hari ini (dari order selesai)
        $revenueToday = Order::whereDate('tanggal_order', $today)
            ->where('status', 'selesai')
            ->sum('total_harga');

        // Order pending yang perlu ditindaklanjuti
        $pendingOrders = Order::where('status', 'pending')->count();

        // Order bulan ini
        $ordersThisMonth = Order::whereMonth('tanggal_order', Carbon::now()->month)
            ->whereYear('tanggal_order', Carbon::now()->year)
            ->count();

        // Pendapatan bulan ini
        $revenueThisMonth = Order::whereMonth('tanggal_order', Carbon::now()->month)
            ->whereYear('tanggal_order', Carbon::now()->year)
            ->where('status', 'selesai')
            ->sum('total_harga');

        return response()->json([
            'success' => true,
            'message' => 'Ringkasan dashboard berhasil diambil',
            'data' => [
                'today' => [
                    'orders' => $ordersToday,
                    'revenue' => $revenueToday,
                ],
                'this_month' => [
                    'orders' => $ordersThisMonth,
                    'revenue' => $revenueThisMonth,
                ],
                'alerts' => [
                    'pending_orders' => $pendingOrders,
                ],
            ]
        ]);
    }

    /**
     * Get statistik chart untuk dashboard
     */
    public function charts(Request $request)
    {
        $days = $request->input('days', 30); // Default 30 hari
        $endDate = Carbon::now();
        $startDate = Carbon::now()->subDays($days);

        // 1. Grafik Pendapatan Harian
        $dailyRevenue = Order::where('status', 'selesai')
            ->whereBetween('tanggal_order', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->select(
                DB::raw('DATE(tanggal_order) as date'),
                DB::raw('SUM(total_harga) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // 2. Grafik Order by Status (Pie Chart)
        $ordersByStatus = Order::whereBetween('tanggal_order', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get();

        // 3. Grafik Menu Terlaris (Bar Chart)
        $topMenus = OrderDetail::whereHas('order', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('tanggal_order', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                  ->where('status', 'selesai');
            })
            ->select('menu_id', DB::raw('SUM(jumlah) as total'))
            ->groupBy('menu_id')
            ->orderBy('total', 'desc')
            ->with('menu:id,nama,kategori')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data chart berhasil diambil',
            'data' => [
                'daily_revenue' => $dailyRevenue,
                'orders_by_status' => $ordersByStatus,
                'top_menus' => $topMenus,
            ]
        ]);
    }
}
