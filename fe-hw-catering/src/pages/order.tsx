import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { orderApi, Order, OrderFormData, OrderStatus } from '@/lib/api/order';
import { pelangganApi, Pelanggan, PelangganFormData } from '@/lib/api/pelanggan';
import { menuApi, Menu } from '@/lib/api/menu';

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  { value: 'dikonfirmasi', label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-700' },
  { value: 'diproses', label: 'Diproses', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'dikirim', label: 'Dikirim', color: 'bg-purple-100 text-purple-700' },
  { value: 'selesai', label: 'Selesai', color: 'bg-green-100 text-green-700' },
  { value: 'dibatalkan', label: 'Dibatalkan', color: 'bg-red-100 text-red-700' },
];

function OrderContent() {
  const router = useRouter();
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pelanggans, setPelanggans] = useState<Pelanggan[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPelangganModal, setShowPelangganModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [pelangganFormData, setPelangganFormData] = useState<PelangganFormData>({
    nama: '',
    email: '',
    telepon: '',
    alamat: '',
  });

  const [formData, setFormData] = useState<OrderFormData>({
    pelanggan_id: 0,
    tanggal_order: new Date().toISOString().split('T')[0],
    tanggal_acara: '',
    waktu_acara: '',
    alamat_pengiriman: '',
    jumlah_tamu: 0,
    catatan: '',
    items: [],
  });

  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown !== null && !(event.target as Element).closest('.dropdown-action')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  useEffect(() => {
    fetchOrder();
    fetchPelanggan();
    fetchMenu();
  }, [search, filterStatus, currentPage, perPage]);

  const fetchOrder = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await orderApi.getAll(token, {
        search: search || undefined,
        status: filterStatus || undefined,
        page: currentPage,
        per_page: perPage,
      });
      setOrders(response.data.data);
      setCurrentPage(response.data.current_page || 1);
      setTotalPages(response.data.last_page || 1);
      setTotal(response.data.total || 0);
      setPerPage(response.data.per_page || 10);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPelanggan = async () => {
    if (!token) return;
    try {
      const response = await pelangganApi.getAll(token, { per_page: 100 });
      setPelanggans(response.data.data);
    } catch (err: any) {
      console.error('Error fetching pelanggan:', err);
    }
  };

  const fetchMenu = async () => {
    if (!token) return;
    try {
      const response = await menuApi.getAll(token, { per_page: 100, tersedia: true });
      setMenus(response.data.data);
    } catch (err: any) {
      console.error('Error fetching menu:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (formData.items.length === 0) {
      setError('Minimal harus ada 1 item menu');
      return;
    }

    try {
      if (editingOrder) {
        await orderApi.update(token, editingOrder.id, {
          pelanggan_id: formData.pelanggan_id,
          tanggal_order: formData.tanggal_order,
          tanggal_acara: formData.tanggal_acara,
          waktu_acara: formData.waktu_acara?.substring(0, 5),
          alamat_pengiriman: formData.alamat_pengiriman,
          jumlah_tamu: formData.jumlah_tamu,
          catatan: formData.catatan,
          items: formData.items,
        });
        setSuccessMessage('Order berhasil diupdate');
      } else {
        await orderApi.create(token, formData);
        setSuccessMessage('Order berhasil ditambahkan');
      }
      setShowModal(false);
      resetForm();
      fetchOrder();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('Yakin ingin menghapus order ini? Hanya bisa delete jika status masih pending.')) return;

    try {
      await orderApi.delete(token, id);
      setSuccessMessage('Order berhasil dihapus');
      fetchOrder();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateStatus = async () => {
    if (!token || !selectedOrder) return;

    try {
      await orderApi.updateStatus(token, selectedOrder.id, newStatus);
      setSuccessMessage('Status order berhasil diupdate');
      setShowStatusModal(false);
      setSelectedOrder(null);
      fetchOrder();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      pelanggan_id: order.pelanggan_id,
      tanggal_order: order.tanggal_order,
      tanggal_acara: order.tanggal_acara,
      waktu_acara: order.waktu_acara,
      alamat_pengiriman: order.alamat_pengiriman,
      jumlah_tamu: order.jumlah_tamu,
      catatan: order.catatan || '',
      items: order.order_detail?.map(item => ({
        menu_id: item.menu_id,
        jumlah: item.jumlah,
        catatan: item.catatan,
      })) || [],
    });
    setShowModal(true);
  };

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const openDetailModal = (order: Order) => {
    router.push(`/order/${order.id}`);
  };



  const resetForm = () => {
    setFormData({
      pelanggan_id: 0,
      tanggal_order: new Date().toISOString().split('T')[0],
      tanggal_acara: '',
      waktu_acara: '',
      alamat_pengiriman: '',
      jumlah_tamu: 0,
      catatan: '',
      items: [],
    });
    setEditingOrder(null);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { menu_id: 0, jumlah: 0, catatan: '' }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleAddPelanggan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await pelangganApi.create(token, pelangganFormData);
      setSuccessMessage('Pelanggan berhasil ditambahkan');
      setShowPelangganModal(false);
      resetPelangganForm();
      await fetchPelanggan();
      // Set pelanggan yang baru ditambahkan sebagai selected
      setFormData({ ...formData, pelanggan_id: response.data.id });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetPelangganForm = () => {
    setPelangganFormData({
      nama: '',
      email: '',
      telepon: '',
      alamat: '',
    });
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Manajemen Order</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola pesanan pelanggan</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Order
          </button>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Cari order (nomor order atau nama pelanggan)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as OrderStatus | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Semua Status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Info total */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Menampilkan {orders.length > 0 ? ((currentPage - 1) * perPage) + 1 : 0} - {Math.min(currentPage * perPage, total)} dari {total} order
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Per halaman:</label>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomor Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Acara</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Tidak ada data order</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.nomor_order}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{order.pelanggan?.nama}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(order.tanggal_acara).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatRupiah(order.total_harga)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="relative dropdown-action">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === order.id ? null : order.id)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>

                          {activeDropdown === order.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                              <button
                                onClick={() => {
                                  openDetailModal(order);
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Detail
                              </button>

                              <button
                                onClick={() => {
                                  openStatusModal(order);
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Update Status
                              </button>



                              {order.status !== 'selesai' && order.status !== 'dibatalkan' && (
                                <button
                                  onClick={() => {
                                    openEditModal(order);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                              )}

                              {order.status === 'pending' && (
                                <button
                                  onClick={() => {
                                    if (confirm('Yakin ingin menghapus order ini? Hanya bisa delete jika status masih pending.')) {
                                      handleDelete(order.id);
                                    }
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Hapus
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {/* First page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
                    >
                      1
                    </button>
                    {currentPage > 4 && (
                      <span className="text-gray-500">...</span>
                    )}
                  </>
                )}

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return page === currentPage ||
                      page === currentPage - 1 ||
                      page === currentPage + 1 ||
                      (page === currentPage - 2 && currentPage <= 3) ||
                      (page === currentPage + 2 && currentPage >= totalPages - 2);
                  })
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 flex items-center justify-center border rounded-lg text-sm font-medium transition-colors ${currentPage === page
                        ? 'bg-yellow-500 text-white border-yellow-500'
                        : 'border-gray-300 text-gray-700 hover:bg-white'
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Modal Form Order */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl my-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingOrder ? 'Edit Order' : 'Tambah Order'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {!editingOrder && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-sm font-medium text-gray-700">Pelanggan</label>
                      <button
                        type="button"
                        onClick={() => setShowPelangganModal(true)}
                        className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                      >
                        + Tambah Pelanggan Baru
                      </button>
                    </div>
                    <select
                      value={formData.pelanggan_id}
                      onChange={(e) => setFormData({ ...formData, pelanggan_id: parseInt(e.target.value) })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="">Pilih Pelanggan</option>
                      {pelanggans.map(p => (
                        <option key={p.id} value={p.id}>{p.nama} - {p.telepon}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Acara</label>
                    <input
                      type="date"
                      value={formData.tanggal_acara}
                      onChange={(e) => setFormData({ ...formData, tanggal_acara: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Waktu Acara</label>
                    <input
                      type="time"
                      value={formData.waktu_acara}
                      onChange={(e) => setFormData({ ...formData, waktu_acara: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Pengiriman</label>
                  <textarea
                    value={formData.alamat_pengiriman}
                    onChange={(e) => setFormData({ ...formData, alamat_pengiriman: e.target.value })}
                    required
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jumlah Tamu</label>
                  <input
                    type="text"
                    value={formData.jumlah_tamu ? formData.jumlah_tamu.toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\./g, '');
                      const numValue = parseInt(value) || 0;
                      setFormData({ ...formData, jumlah_tamu: numValue });
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan</label>
                  <textarea
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {!editingOrder && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Item Menu</label>
                      <button
                        type="button"
                        onClick={addItem}
                        className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                      >
                        + Tambah Item
                      </button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {formData.items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                          <div className="flex-1">
                            <select
                              value={item.menu_id}
                              onChange={(e) => updateItem(index, 'menu_id', parseInt(e.target.value))}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                            >
                              <option value="">Pilih Menu</option>
                              {menus.map(m => (
                                <option key={m.id} value={m.id}>{m.nama} - {formatRupiah(m.harga)}</option>
                              ))}
                            </select>
                          </div>
                          <div className="w-24">
                            <input
                              type="text"
                              value={item.jumlah ? item.jumlah.toLocaleString('id-ID') : ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\./g, '');
                                const numValue = parseInt(value) || 0;
                                updateItem(index, 'jumlah', numValue);
                              }}
                              required
                              placeholder="Jumlah"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    {editingOrder ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Status */}
        {showStatusModal && selectedOrder && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Update Status</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedOrder.nomor_order}</p>
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
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedOrder(null);
                    }}
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

        {/* Modal Tambah Pelanggan */}
        {showPelangganModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Tambah Pelanggan</h2>
              </div>
              <form onSubmit={handleAddPelanggan} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama</label>
                  <input
                    type="text"
                    value={pelangganFormData.nama}
                    onChange={(e) => setPelangganFormData({ ...pelangganFormData, nama: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={pelangganFormData.email}
                    onChange={(e) => setPelangganFormData({ ...pelangganFormData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Telepon</label>
                  <input
                    type="tel"
                    value={pelangganFormData.telepon}
                    onChange={(e) => setPelangganFormData({ ...pelangganFormData, telepon: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
                  <textarea
                    value={pelangganFormData.alamat}
                    onChange={(e) => setPelangganFormData({ ...pelangganFormData, alamat: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPelangganModal(false);
                      resetPelangganForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default function OrderPage() {
  return (
    <ProtectedRoute>
      <OrderContent />
    </ProtectedRoute>
  );
}
