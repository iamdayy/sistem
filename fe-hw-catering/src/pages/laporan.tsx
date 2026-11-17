import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { LaporanResponse, orderApi, OrderStatus } from '@/lib/api/order';
import { useEffect, useState } from 'react';

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  { value: 'dikonfirmasi', label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-700' },
  { value: 'diproses', label: 'Diproses', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'dikirim', label: 'Dikirim', color: 'bg-purple-100 text-purple-700' },
  { value: 'selesai', label: 'Selesai', color: 'bg-green-100 text-green-700' },
  { value: 'dibatalkan', label: 'Dibatalkan', color: 'bg-red-100 text-red-700' },
];

function LaporanContent() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [laporan, setLaporan] = useState<LaporanResponse['data'] | null>(null);

  // Default periode: bulan ini
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [tanggalMulai, setTanggalMulai] = useState(firstDay.toISOString().split('T')[0]);
  const [tanggalAkhir, setTanggalAkhir] = useState(lastDay.toISOString().split('T')[0]);

  const fetchLaporan = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const response = await orderApi.getLaporan(token, {
        tanggal_mulai: tanggalMulai,
        tanggal_akhir: tanggalAkhir,
      });
      setLaporan(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: OrderStatus) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: OrderStatus) => {
    return statusOptions.find(s => s.value === status)?.label || status;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Laporan Order</h1>
          <p className="text-sm text-gray-500 mt-1">Laporan dan statistik pesanan</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filter Periode */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Mulai</label>
              <input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Akhir</label>
              <input
                type="date"
                value={tanggalAkhir}
                onChange={(e) => setTanggalAkhir(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <button
              onClick={fetchLaporan}
              disabled={loading}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-300"
            >
              {loading ? 'Loading...' : 'Tampilkan Laporan'}
            </button>
          </div>
        </div>

        {laporan && (
          <>
            {/* Ringkasan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Order */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Order</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{laporan.ringkasan.total_order}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Pendapatan */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Pendapatan</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-1">{formatRupiah(laporan.ringkasan.total_pendapatan)}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Order</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statusOptions.map((status) => (
                  <div key={status.value} className="text-center">
                    <div className={`px-3 py-2 rounded-lg ${status.color} mb-2`}>
                      <p className="text-2xl font-bold">{laporan.ringkasan.status[status.value]}</p>
                    </div>
                    <p className="text-xs text-gray-600">{status.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Menu Terlaris */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Menu Terlaris</h2>
              <div className="space-y-3">
                {laporan.menu_terlaris.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Tidak ada data menu terlaris</p>
                ) : (
                  laporan.menu_terlaris.map((item, idx) => (
                    <div key={item.menu_id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.menu.nama}</p>
                          <p className="text-sm text-gray-600">{formatRupiah(item.menu.harga)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-600">{item.total_terjual}</p>
                        <p className="text-xs text-gray-500">porsi terjual</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Detail Orders (Optional - collapsed by default) */}
            {laporan.orders.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Detail Order ({laporan.orders.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomor Order</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {laporan.orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.nomor_order}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{order.pelanggan?.nama}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(order.tanggal_order).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatRupiah(order.total_harga)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Loading laporan...</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function LaporanPage() {
  return (
    <ProtectedRoute>
      <LaporanContent />
    </ProtectedRoute>
  );
}
