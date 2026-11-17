import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { dashboardApi, DashboardData, DashboardSummary } from '@/lib/api/dashboard';

function DashboardContent() {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchDashboard();
  }, [dateRange]);

  const fetchDashboard = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [dataResponse, summaryResponse] = await Promise.all([
        dashboardApi.getData(token, dateRange),
        dashboardApi.getSummary(token),
      ]);
      setDashboardData(dataResponse.data);
      setSummary(summaryResponse.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Ringkasan dan statistik sistem</p>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Mulai</label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Akhir</label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Order Hari Ini</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{summary.today.orders}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Pendapatan: {formatRupiah(summary.today.revenue)}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Order Bulan Ini</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{summary.this_month.orders}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Pendapatan: {formatRupiah(summary.this_month.revenue)}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Order Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{summary.alerts.pending_orders}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Perlu dikonfirmasi</p>
            </div>
          </div>
        )}

        {dashboardData && (
          <>
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Total Data */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Total Data Master</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.total_data.bahan}</p>
                    <p className="text-sm text-gray-600 mt-1">Bahan</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.total_data.resep}</p>
                    <p className="text-sm text-gray-600 mt-1">Resep</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.total_data.menu}</p>
                    <p className="text-sm text-gray-600 mt-1">Menu</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.total_data.pelanggan}</p>
                    <p className="text-sm text-gray-600 mt-1">Pelanggan</p>
                  </div>
                </div>
              </div>

              {/* Order Statistics */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistik Order (Periode)</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Order</span>
                    <span className="text-lg font-bold text-gray-900">{dashboardData.order_statistics.total_orders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Pendapatan</span>
                    <span className="text-lg font-bold text-green-600">{formatRupiah(dashboardData.order_statistics.total_revenue)}</span>
                  </div>
                  <div className="border-t pt-3 mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pending</span>
                      <span className="font-medium">{dashboardData.order_statistics.by_status.pending}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Dikonfirmasi</span>
                      <span className="font-medium">{dashboardData.order_statistics.by_status.dikonfirmasi}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Diproses</span>
                      <span className="font-medium">{dashboardData.order_statistics.by_status.diproses}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Dikirim</span>
                      <span className="font-medium">{dashboardData.order_statistics.by_status.dikirim}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Selesai</span>
                      <span className="font-medium text-green-600">{dashboardData.order_statistics.by_status.selesai}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Dibatalkan</span>
                      <span className="font-medium text-red-600">{dashboardData.order_statistics.by_status.dibatalkan}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Menu & Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Menu Terlaris */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Menu Terlaris</h2>
                <div className="space-y-3">
                  {dashboardData.menu_terlaris.slice(0, 5).map((item, idx) => (
                    <div key={item.menu_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.menu.nama}</p>
                          <p className="text-xs text-gray-500">{item.menu.kategori}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{item.total_terjual} porsi</p>
                        <p className="text-xs text-gray-600">{formatRupiah(item.total_pendapatan)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kategori Terlaris */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Kategori Terlaris</h2>
                <div className="space-y-3">
                  {dashboardData.kategori_terlaris.map((item) => (
                    <div key={item.kategori} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{item.kategori}</p>
                      <p className="font-semibold text-gray-900">{item.total_terjual} porsi</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Customers */}
            {dashboardData.customer_statistics.top_pelanggan.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Pelanggan (Periode)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Pelanggan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Order</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Pembelian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dashboardData.customer_statistics.top_pelanggan.slice(0, 5).map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.nama}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{customer.orders_count} order</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">
                            {formatRupiah(parseFloat(customer.orders_sum_total_harga.toString()))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Pelanggan baru di periode ini: <span className="font-semibold">{dashboardData.customer_statistics.pelanggan_baru}</span>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
