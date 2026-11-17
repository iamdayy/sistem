import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { resepApi, Resep, ResepFormData, BiayaResep } from '@/lib/api/resep';
import { bahanApi, Bahan } from '@/lib/api/bahan';

function ResepContent() {
  const { token } = useAuth();
  const [reseps, setReseps] = useState<Resep[]>([]);
  const [bahans, setBahans] = useState<Bahan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBiayaModal, setShowBiayaModal] = useState(false);
  const [editingResep, setEditingResep] = useState<Resep | null>(null);
  const [selectedResep, setSelectedResep] = useState<Resep | null>(null);
  const [biayaData, setBiayaData] = useState<BiayaResep | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState<ResepFormData>({
    nama: '',
    deskripsi: '',
    cara_membuat: '',
    porsi: 1,
    waktu_persiapan: 0,
    waktu_memasak: 0,
    bahan: [],
  });

  useEffect(() => {
    fetchResep();
    fetchBahan();
  }, [search]);

  const fetchResep = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await resepApi.getAll(token, {
        search: search || undefined,
      });
      setReseps(response.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBahan = async () => {
    if (!token) return;
    try {
      const response = await bahanApi.getAll(token, { per_page: 100 });
      setBahans(response.data.data);
    } catch (err: any) {
      console.error('Error fetching bahan:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (formData.bahan.length === 0) {
      setError('Minimal harus ada 1 bahan');
      return;
    }

    try {
      if (editingResep) {
        await resepApi.update(token, editingResep.id, formData);
        setSuccessMessage('Resep berhasil diupdate');
      } else {
        await resepApi.create(token, formData);
        setSuccessMessage('Resep berhasil ditambahkan');
      }
      setShowModal(false);
      resetForm();
      fetchResep();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('Yakin ingin menghapus resep ini?')) return;

    try {
      await resepApi.delete(token, id);
      setSuccessMessage('Resep berhasil dihapus');
      fetchResep();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleHitungBiaya = async (resep: Resep) => {
    if (!token) return;
    try {
      const response = await resepApi.hitungBiaya(token, resep.id);
      setBiayaData(response.data);
      setSelectedResep(resep);
      setShowBiayaModal(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openEditModal = (resep: Resep) => {
    setEditingResep(resep);
    setFormData({
      nama: resep.nama,
      deskripsi: resep.deskripsi || '',
      cara_membuat: resep.cara_membuat || '',
      porsi: resep.porsi,
      waktu_persiapan: resep.waktu_persiapan,
      waktu_memasak: resep.waktu_memasak,
      bahan: resep.bahan.map(b => ({
        bahan_id: b.bahan_id,
        jumlah: b.jumlah,
        satuan: b.satuan,
      })),
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      deskripsi: '',
      cara_membuat: '',
      porsi: 1,
      waktu_persiapan: 0,
      waktu_memasak: 0,
      bahan: [],
    });
    setEditingResep(null);
  };

  const addBahan = () => {
    setFormData({
      ...formData,
      bahan: [...formData.bahan, { bahan_id: 0, jumlah: 0, satuan: '' }],
    });
  };

  const removeBahan = (index: number) => {
    setFormData({
      ...formData,
      bahan: formData.bahan.filter((_, i) => i !== index),
    });
  };

  const updateBahan = (index: number, field: string, value: any) => {
    const newBahan = [...formData.bahan];
    newBahan[index] = { ...newBahan[index], [field]: value };
    setFormData({ ...formData, bahan: newBahan });
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Manajemen Resep</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola resep masakan</p>
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
            Tambah Resep
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

        {/* Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <input
            type="text"
            placeholder="Cari resep..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500">Loading...</div>
          ) : reseps.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">Tidak ada data resep</div>
          ) : (
            reseps.map((resep) => (
              <div key={resep.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{resep.nama}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{resep.deskripsi}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{resep.porsi} porsi</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Prep: {resep.waktu_persiapan}m | Masak: {resep.waktu_memasak}m</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>{resep.bahan.length} bahan</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleHitungBiaya(resep)}
                      className="flex-1 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-50 transition-colors"
                    >
                      Hitung Biaya
                    </button>
                    <button
                      onClick={() => openEditModal(resep)}
                      className="text-sm text-yellow-600 hover:text-yellow-700 font-medium border border-yellow-200 rounded-lg px-3 py-2 hover:bg-yellow-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(resep.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Form Resep */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl my-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingResep ? 'Edit Resep' : 'Tambah Resep'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Resep</label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Porsi</label>
                    <input
                      type="number"
                      value={formData.porsi}
                      onChange={(e) => setFormData({ ...formData, porsi: parseInt(e.target.value) })}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Waktu Prep (menit)</label>
                    <input
                      type="number"
                      value={formData.waktu_persiapan}
                      onChange={(e) => setFormData({ ...formData, waktu_persiapan: parseInt(e.target.value) })}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Waktu Masak (menit)</label>
                    <input
                      type="number"
                      value={formData.waktu_memasak}
                      onChange={(e) => setFormData({ ...formData, waktu_memasak: parseInt(e.target.value) })}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cara Membuat</label>
                  <textarea
                    value={formData.cara_membuat}
                    onChange={(e) => setFormData({ ...formData, cara_membuat: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Bahan-bahan</label>
                    <button
                      type="button"
                      onClick={addBahan}
                      className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      + Tambah Bahan
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {formData.bahan.map((bahan, index) => (
                      <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <select
                            value={bahan.bahan_id}
                            onChange={(e) => updateBahan(index, 'bahan_id', parseInt(e.target.value))}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                          >
                            <option value="">Pilih Bahan</option>
                            {bahans.map(b => (
                              <option key={b.id} value={b.id}>{b.nama}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            value={bahan.jumlah}
                            onChange={(e) => updateBahan(index, 'jumlah', parseFloat(e.target.value))}
                            required
                            step="0.01"
                            placeholder="Jumlah"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                          />
                        </div>
                        <div className="w-20">
                          <input
                            type="text"
                            value={bahan.satuan}
                            onChange={(e) => updateBahan(index, 'satuan', e.target.value)}
                            required
                            placeholder="Satuan"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBahan(index)}
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
                    {editingResep ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Biaya */}
        {showBiayaModal && biayaData && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-900">Estimasi Biaya</h2>
                <p className="text-sm text-gray-500 mt-1">{biayaData.resep}</p>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Porsi</span>
                    <span className="font-medium">{biayaData.porsi}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Detail Biaya:</h3>
                  <div className="space-y-2">
                    {biayaData.detail_biaya.map((detail, index) => (
                      <div key={index} className="flex justify-between items-start text-sm bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{detail.bahan}</p>
                          <p className="text-gray-600 text-xs">
                            {detail.jumlah} {detail.satuan} × {formatRupiah(detail.harga_per_satuan)}
                          </p>
                        </div>
                        <span className="font-medium">{formatRupiah(detail.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Biaya</span>
                    <span className="font-bold text-lg text-gray-900">{formatRupiah(biayaData.total_biaya)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Biaya per Porsi</span>
                    <span className="font-semibold text-yellow-600">{formatRupiah(biayaData.biaya_per_porsi)}</span>
                  </div>
                </div>

              </div>
              <div className="p-6 border-t border-gray-200 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowBiayaModal(false);
                    setBiayaData(null);
                  }}
                  className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function ResepPage() {
  return (
    <ProtectedRoute requireAdmin>
      <ResepContent />
    </ProtectedRoute>
  );
}
