import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import {
  bahanApi,
  Bahan,
  BahanFormData,
} from "@/lib/api/bahan";

function BahanContent() {
  const { token } = useAuth();
  const [bahans, setBahans] = useState<Bahan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stokRendah, setStokRendah] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showStokModal, setShowStokModal] = useState(false);
  const [editingBahan, setEditingBahan] = useState<Bahan | null>(null);
  const [selectedBahan, setSelectedBahan] = useState<Bahan | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [formData, setFormData] = useState<BahanFormData>({
    nama: "",
    satuan: "",
    harga_per_satuan: 0,
  });

  useEffect(() => {
    fetchBahan();
  }, [search, stokRendah, currentPage, perPage]);

  const fetchBahan = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await bahanApi.getAll(token, {
        search: search || undefined,
        page: currentPage,
        per_page: perPage,
      });
      setBahans(response.data.data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (editingBahan) {
        await bahanApi.update(token, editingBahan.id, formData);
        setSuccessMessage("Bahan berhasil diupdate");
      } else {
        await bahanApi.create(token, formData);
        setSuccessMessage("Bahan berhasil ditambahkan");
      }
      setShowModal(false);
      resetForm();
      fetchBahan();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm("Yakin ingin menghapus bahan ini?")) return;

    try {
      await bahanApi.delete(token, id);
      setSuccessMessage("Bahan berhasil dihapus");
      fetchBahan();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };


  const openEditModal = (bahan: Bahan) => {
    setEditingBahan(bahan);
    setFormData({
      nama: bahan.nama,
      satuan: bahan.satuan,
      harga_per_satuan: bahan.harga_per_satuan,
    });
    setShowModal(true);
  };

  const openStokModal = (bahan: Bahan) => {
    setSelectedBahan(bahan);
    setShowStokModal(true);
  };

  const resetForm = () => {
    setFormData({
      nama: "",
      satuan: "",
      harga_per_satuan: 0,
    });
    setEditingBahan(null);
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Manajemen Bahan
            </h1>
            <p className="text-sm text-gray-500 mt-1">Kelola data bahan baku</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tambah Bahan
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
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari bahan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Info total */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Menampilkan {bahans.length > 0 ? ((currentPage - 1) * perPage) + 1 : 0} - {Math.min(currentPage * perPage, total)} dari {total} bahan
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Satuan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Harga/Satuan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : bahans.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Tidak ada data bahan
                    </td>
                  </tr>
                ) : (
                  bahans.map((bahan) => (
                    <tr key={bahan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {bahan.nama}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {bahan.satuan}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatRupiah(bahan.harga_per_satuan)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(bahan)}
                            className="text-yellow-600 hover:text-yellow-700 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(bahan.id)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Hapus
                          </button>
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

        {/* Modal Form Bahan */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingBahan ? "Edit Bahan" : "Tambah Bahan"}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nama Bahan
                  </label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Satuan
                    </label>
                    <input
                      type="text"
                      value={formData.satuan}
                      onChange={(e) =>
                        setFormData({ ...formData, satuan: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Harga per Satuan
                  </label>
                  <input
                    type="number"
                    value={formData.harga_per_satuan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        harga_per_satuan: parseFloat(e.target.value),
                      })
                    }
                    required
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
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
                    {editingBahan ? "Update" : "Simpan"}
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

export default function BahanPage() {
  return (
    <ProtectedRoute requireAdmin>
      <BahanContent />
    </ProtectedRoute>
  );
}
