import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { orderApi, Order, OrderStatus, PaymentStatus, RincianBelanjaResponse } from '@/lib/api/order';
import Link from 'next/link';

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  { value: 'dikonfirmasi', label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-700' },
  { value: 'diproses', label: 'Diproses', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'dikirim', label: 'Dikirim', color: 'bg-purple-100 text-purple-700' },
  { value: 'selesai', label: 'Selesai', color: 'bg-green-100 text-green-700' },
  { value: 'dibatalkan', label: 'Dibatalkan', color: 'bg-red-100 text-red-700' },
];

function OrderDetailContent() {
  const router = useRouter();
  const { id } = router.query;
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [rincianBelanja, setRincianBelanja] = useState<RincianBelanjaResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [successMessage, setSuccessMessage] = useState('');
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [showPaymentDPModal, setShowPaymentDPModal] = useState(false);
  const [showPaymentFullModal, setShowPaymentFullModal] = useState(false);
  const [downloadingRincian, setDownloadingRincian] = useState(false);
  const [dpAmount, setDpAmount] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (id && token) {
      fetchOrder();
    }
  }, [id, token]);

  const fetchOrder = async () => {
    if (!token || !id) return;
    try {
      setLoading(true);
      const response = await orderApi.getById(token, parseInt(id as string));
      setOrder(response.data);
      setNewStatus(response.data.status);

      // Fetch rincian belanja
      try {
        const rincianResponse = await orderApi.getRincianBelanja(token, parseInt(id as string));
        if (rincianResponse.success) {
          setRincianBelanja(rincianResponse.data);
        }
      } catch (err) {
        console.error('Failed to fetch rincian belanja:', err);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!token || !order) return;

    try {
      await orderApi.updateStatus(token, order.id, newStatus);
      setSuccessMessage('Status order berhasil diupdate');
      setShowStatusModal(false);
      fetchOrder();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!token || !order) return;

    try {
      setDownloadingInvoice(true);
      await orderApi.downloadInvoice(token, order.id);
      setSuccessMessage('Invoice berhasil didownload');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const handleDownloadRincianBelanja = async () => {
    if (!token || !order) return;

    try {
      setDownloadingRincian(true);
      await orderApi.downloadRincianBelanja(token, order.id);
      setSuccessMessage('Rincian belanja berhasil didownload');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setDownloadingRincian(false);
    }
  };

  const handlePreviewInvoice = () => {
    if (!order || !order.invoice_token) return;
    const previewUrl = orderApi.previewInvoicePublic(order.invoice_token);
    window.open(previewUrl, '_blank');
  };

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

  const getPaymentStatusFromOrder = (order: Order): string => {
    if (order.paid_full) return 'lunas';
    if (order.dp_paid) return 'dp';
    return 'belum_bayar';
  };

  const getPaymentStatusLabel = (status?: PaymentStatus | string) => {
    if (!status) return 'Belum Bayar';
    const labels: Record<string, string> = {
      'belum_bayar': 'Belum Bayar',
      'cash': 'Cash',
      'dp': 'DP Dibayar',
      'lunas': 'Lunas',
    };
    return labels[status] || status;
  };

  const getPaymentStatusColor = (status?: PaymentStatus | string) => {
    if (!status || status === 'belum_bayar') return 'bg-red-100 text-red-700';
    if (status === 'dp') return 'bg-yellow-100 text-yellow-700';
    if (status === 'lunas' || status === 'cash') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getDPPaidAmount = (order: Order): number => {
    if (order.dp_paid && order.dp_amount) {
      return typeof order.dp_amount === 'string' ? parseFloat(order.dp_amount) : order.dp_amount;
    }
    return 0;
  };

  const getRemainingPayment = (order: Order): number => {
    if (order.remaining_amount !== undefined) {
      return typeof order.remaining_amount === 'string' ? parseFloat(order.remaining_amount) : order.remaining_amount;
    }
    const totalHarga = typeof order.total_harga === 'string' ? parseFloat(order.total_harga) : order.total_harga;
    const dpPaid = getDPPaidAmount(order);
    return totalHarga - dpPaid;
  };

  const formatInputRupiah = (value: string) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    // Format as Rupiah
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseRupiahToNumber = (value: string): number => {
    // Remove all dots and parse to number
    return parseInt(value.replace(/\./g, '')) || 0;
  };

  const handleDPAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputRupiah(e.target.value);
    setDpAmount(formatted);
  };

  const handlePayDP = async () => {
    if (!token || !order || !dpAmount) return;

    const amount = parseRupiahToNumber(dpAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Jumlah DP tidak valid');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (amount > order.total_harga) {
      setError('Jumlah DP tidak boleh melebihi total harga');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setProcessingPayment(true);
      await orderApi.payDP(token, order.id, amount);
      setSuccessMessage('DP berhasil dibayar');
      setShowPaymentDPModal(false);
      setDpAmount('');
      fetchOrder();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePayFull = async () => {
    if (!token || !order) return;

    try {
      setProcessingPayment(true);
      await orderApi.payFull(token, order.id);
      setSuccessMessage('Pembayaran berhasil dilunasi');
      setShowPaymentFullModal(false);
      fetchOrder();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setProcessingPayment(false);
    }
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

  if (error || !order) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || 'Order tidak ditemukan'}
          </div>
          <Link href="/order" className="text-yellow-600 hover:text-yellow-700 font-medium">
            ← Kembali ke List Order
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/order" className="text-sm text-yellow-600 hover:text-yellow-700 font-medium mb-2 inline-block">
              ← Kembali ke List Order
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Detail Order</h1>
            <p className="text-sm text-gray-500 mt-1">{order.nomor_order}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreviewInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview Invoice
            </button>
            <button
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {downloadingInvoice ? 'Downloading...' : 'Download Invoice'}
            </button>
            <button
              onClick={() => setShowStatusModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Update Status
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informasi Order & Pengiriman */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Order</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tanggal Order</p>
                <p className="font-medium">{new Date(order.tanggal_order).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tanggal Acara</p>
                <p className="font-medium">{new Date(order.tanggal_acara).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Waktu Acara</p>
                <p className="font-medium">{order.waktu_acara}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Jumlah Tamu</p>
                <p className="font-medium">{order.jumlah_tamu.toLocaleString('id-ID')} orang</p>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">Alamat Pengiriman</p>
                <p className="font-medium">{order.alamat_pengiriman}</p>
              </div>
              {order.catatan && (
                <div>
                  <p className="text-sm text-gray-600">Catatan</p>
                  <p className="font-medium">{order.catatan}</p>
                </div>
              )}
            </div>
          </div>

          {/* Informasi Pembayaran */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pembayaran</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Status Pembayaran</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getPaymentStatusColor(getPaymentStatusFromOrder(order))}`}>
                  {getPaymentStatusLabel(getPaymentStatusFromOrder(order))}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Harga</p>
                <p className="font-bold text-lg text-gray-900">{formatRupiah(order.total_harga)}</p>
              </div>
              {order.dp_paid && getDPPaidAmount(order) > 0 && (
                <div>
                  <p className="text-sm text-gray-600">DP Dibayar</p>
                  <p className="font-medium text-green-600">{formatRupiah(getDPPaidAmount(order))}</p>
                  {order.dp_paid_at && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.dp_paid_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              )}
              {!order.paid_full && (
                <div>
                  <p className="text-sm text-gray-600">Sisa Pembayaran</p>
                  <p className="font-medium text-red-600">{formatRupiah(getRemainingPayment(order))}</p>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 space-y-2">
                {!order.paid_full && (
                  <>
                    {!order.dp_paid && (
                      <button
                        onClick={() => setShowPaymentDPModal(true)}
                        className="w-full px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                      >
                        Bayar DP
                      </button>
                    )}
                    <button
                      onClick={() => setShowPaymentFullModal(true)}
                      className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      {order.dp_paid ? 'Lunasi' : 'Bayar Lunas'}
                    </button>
                  </>
                )}
                {order.paid_full && (
                  <div className="text-center py-2">
                    <p className="text-green-600 font-medium">✓ Sudah Lunas</p>
                    {order.paid_full_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.paid_full_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informasi Pelanggan */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pelanggan</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="font-medium">{order.pelanggan?.nama}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{order.pelanggan?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telepon</p>
                <p className="font-medium">{order.pelanggan?.telepon}</p>
              </div>
              {order.pelanggan?.alamat && (
                <div>
                  <p className="text-sm text-gray-600">Alamat</p>
                  <p className="font-medium">{order.pelanggan.alamat}</p>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Item Order */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Order</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Menu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga Satuan</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.order_detail && order.order_detail.length > 0 ? (
                  order.order_detail.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">{item.menu.nama}</p>
                        {item.menu.deskripsi && (
                          <p className="text-sm text-gray-600 mt-1">{item.menu.deskripsi}</p>
                        )}
                        {item.catatan && (
                          <p className="text-xs text-gray-500 mt-1 italic">Note: {item.catatan}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          {item.menu.kategori}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-gray-900">
                        {formatRupiah(parseFloat(item.harga_satuan.toString()))}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium text-gray-900">{item.jumlah.toLocaleString('id-ID')}</span>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-gray-900">
                        {formatRupiah(parseFloat(item.subtotal.toString()))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada item order
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-right font-bold text-lg text-gray-900">
                    Total
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-xl text-yellow-600">
                    {formatRupiah(parseFloat(order.total_harga.toString()))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

       {/* Rincian Belanja Section */}
        {rincianBelanja && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Rincian Belanja</h2>
              <button
                onClick={handleDownloadRincianBelanja}
                disabled={downloadingRincian}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {downloadingRincian ? 'Downloading...' : 'Download PDF'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Nilai Order</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatRupiah(rincianBelanja.order.total_harga)}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Belanja</p>
                <p className="text-xl font-bold text-yellow-700 mt-1">
                  {formatRupiah(rincianBelanja.total_belanja)}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Barang</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Satuan</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga Satuan</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rincianBelanja.rincian_belanja.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.nama}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.jumlah}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.satuan}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">{formatRupiah(item.harga)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatRupiah(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-right font-bold text-sm text-gray-900">Total Belanja</td>
                    <td className="px-4 py-3 text-right font-bold text-base text-yellow-600">
                      {formatRupiah(rincianBelanja.total_belanja)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Modal Update Status */}
        {showStatusModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Update Status</h2>
                <p className="text-sm text-gray-500 mt-1">{order.nomor_order}</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Bayar DP */}
        {showPaymentDPModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Bayar DP</h2>
                <p className="text-sm text-gray-500 mt-1">{order.nomor_order}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Harga Order</p>
                  <p className="text-2xl font-bold text-gray-900">{formatRupiah(order.total_harga)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jumlah DP</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">Rp</span>
                    <input
                      type="text"
                      value={dpAmount}
                      onChange={handleDPAmountChange}
                      placeholder="0"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">DP tidak boleh melebihi total harga</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowPaymentDPModal(false);
                      setDpAmount('');
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={processingPayment}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handlePayDP}
                    disabled={processingPayment || !dpAmount}
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {processingPayment ? 'Memproses...' : 'Bayar DP'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Bayar Lunas */}
        {showPaymentFullModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Konfirmasi Pelunasan</h2>
                <p className="text-sm text-gray-500 mt-1">{order.nomor_order}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">Total Harga</p>
                    <p className="font-semibold text-gray-900">{formatRupiah(order.total_harga)}</p>
                  </div>
                  {order.dp_paid && getDPPaidAmount(order) > 0 && (
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">DP Dibayar</p>
                      <p className="font-semibold text-green-600">-{formatRupiah(getDPPaidAmount(order))}</p>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <p className="text-sm font-medium text-gray-900">Yang Harus Dibayar</p>
                    <p className="text-xl font-bold text-yellow-600">
                      {formatRupiah(getRemainingPayment(order))}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  Apakah Anda yakin ingin melunasi pembayaran order ini?
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowPaymentFullModal(false);
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={processingPayment}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handlePayFull}
                    disabled={processingPayment}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {processingPayment ? 'Memproses...' : 'Lunasi'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailContent />
    </ProtectedRoute>
  );
}
