import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, menuApi, MenuFormData } from '@/lib/api/menu';
import { Resep, resepApi } from '@/lib/api/resep';
import Image from 'next/image';
import { useEffect, useState } from 'react';

function MenuContent() {
  const { token, isAdmin } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [reseps, setReseps] = useState<Resep[]>([]);
  const [kategoris, setKategoris] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterTersedia, setFilterTersedia] = useState<boolean | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [previewImage, setPreviewImage] = useState<string>('');

  const [formData, setFormData] = useState<MenuFormData>({
    nama: '',
    deskripsi: '',
    harga: 0,
    kategori: '',
    foto: undefined,
    tersedia: true,
    resep: [],
  });

  useEffect(() => {
    fetchMenu();
    fetchResep();
    fetchKategori();
  }, [search, filterKategori, filterTersedia]);

  const fetchMenu = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await menuApi.getAll(token, {
        search: search || undefined,
        kategori: filterKategori || undefined,
        tersedia: filterTersedia,
      });
      setMenus(response.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchResep = async () => {
    if (!token) return;
    try {
      const response = await resepApi.getAll(token, { per_page: 100 });
      setReseps(response.data.data);
    } catch (err: any) {
      console.error('Error fetching resep:', err);
    }
  };

  const fetchKategori = async () => {
    if (!token) return;
    try {
      const response = await menuApi.getKategori(token);
      setKategoris(response.data);
    } catch (err: any) {
      console.error('Error fetching kategori:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (formData.resep.length === 0) {
      setError('Minimal harus ada 1 resep');
      return;
    }

    try {
      if (editingMenu) {
        await menuApi.update(token, editingMenu.id, formData);
        setSuccessMessage('Menu berhasil diupdate');
      } else {
        await menuApi.create(token, formData);
        setSuccessMessage('Menu berhasil ditambahkan');
      }
      setShowModal(false);
      resetForm();
      fetchMenu();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('Yakin ingin menghapus menu ini?')) return;

    try {
      await menuApi.delete(token, id);
      setSuccessMessage('Menu berhasil dihapus');
      fetchMenu();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleAvailability = async (id: number) => {
    if (!token) return;
    try {
      await menuApi.toggleAvailability(token, id);
      setSuccessMessage('Ketersediaan menu berhasil diubah');
      fetchMenu();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openEditModal = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      nama: menu.nama,
      deskripsi: menu.deskripsi || '',
      harga: menu.harga,
      kategori: menu.kategori,
      foto: undefined,
      tersedia: menu.tersedia,
      resep: menu.resep.map(r => ({
        resep_id: r.pivot.resep_id,
        jumlah_porsi: r.pivot.jumlah_porsi,
      })),
    });
    if (menu.foto) {
      setPreviewImage(process.env.NEXT_PUBLIC_STORAGE_URL + menu.foto);
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      deskripsi: '',
      harga: 0,
      kategori: '',
      foto: undefined,
      tersedia: true,
      resep: [],
    });
    setEditingMenu(null);
    setPreviewImage('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, foto: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addResep = () => {
    setFormData({
      ...formData,
      resep: [...formData.resep, { resep_id: 0, jumlah_porsi: 1 }],
    });
  };

  const removeResep = (index: number) => {
    setFormData({
      ...formData,
      resep: formData.resep.filter((_, i) => i !== index),
    });
  };

  const updateResep = (index: number, field: string, value: any) => {
    const newResep = [...formData.resep];
    newResep[index] = { ...newResep[index], [field]: value };
    setFormData({ ...formData, resep: newResep });
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
            <h1 className="text-2xl font-semibold text-gray-900">Manajemen Menu</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola menu makanan</p>
          </div>
          {isAdmin && (
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
              Tambah Menu
            </button>
          )}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Cari menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Semua Kategori</option>
              {kategoris.map((kat) => (
                <option key={kat} value={kat}>{kat}</option>
              ))}
            </select>
            <select
              value={filterTersedia === undefined ? '' : filterTersedia ? '1' : '0'}
              onChange={(e) => setFilterTersedia(e.target.value === '' ? undefined : e.target.value === '1')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Semua Status</option>
              <option value="1">Tersedia</option>
              <option value="0">Tidak Tersedia</option>
            </select>
          </div>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500">Loading...</div>
          ) : menus.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">Tidak ada data menu</div>
          ) : (
            menus.map((menu) => (
              <div key={menu.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  {menu.foto ? (
                    <Image
                      src={process.env.NEXT_PUBLIC_STORAGE_URL + menu.foto}
                      alt={menu.nama}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Badge Status */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${menu.tersedia
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                      }`}>
                      {menu.tersedia ? 'Tersedia' : 'Tidak Tersedia'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{menu.nama}</h3>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">{menu.kategori}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{menu.deskripsi}</p>
                  <p className="text-xl font-bold text-yellow-600 mb-3">{formatRupiah(menu.harga)}</p>

                  <div className="text-sm text-gray-600 mb-4">
                    <p className="font-medium mb-1">Resep:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {menu.resep.map((r, idx) => (
                        <li key={idx} className="text-xs">
                          {r.nama} ({r.pivot.jumlah_porsi} porsi)
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleToggleAvailability(menu.id)}
                          className="flex-1 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-50 transition-colors"
                        >
                          Toggle Status
                        </button>
                        <button
                          onClick={() => openEditModal(menu)}
                          className="text-sm text-yellow-600 hover:text-yellow-700 font-medium border border-yellow-200 rounded-lg px-3 py-2 hover:bg-yellow-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(menu.id)}
                          className="text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50 transition-colors"
                        >
                          Hapus
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Form Menu */}
        {showModal && isAdmin && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl my-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingMenu ? 'Edit Menu' : 'Tambah Menu'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Menu</label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga</label>
                    <input
                      type="text"
                      value={formData.harga ? formData.harga.toLocaleString('id-ID') : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\./g, '');
                        const numValue = parseInt(value) || 0;
                        setFormData({ ...formData, harga: numValue });
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
                    <input
                      type="text"
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      required
                      placeholder="e.g., paket, snack"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  {previewImage && (
                    <div className="mt-2 relative h-32 w-full bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={previewImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tersedia}
                      onChange={(e) => setFormData({ ...formData, tersedia: e.target.checked })}
                      className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm text-gray-700">Tersedia</span>
                  </label>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Resep</label>
                    <button
                      type="button"
                      onClick={addResep}
                      className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      + Tambah Resep
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {formData.resep.map((resep, index) => (
                      <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <select
                            value={resep.resep_id}
                            onChange={(e) => updateResep(index, 'resep_id', parseInt(e.target.value))}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                          >
                            <option value="">Pilih Resep</option>
                            {reseps.map(r => (
                              <option key={r.id} value={r.id}>{r.nama}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-32">
                          <input
                            type="text"
                            value={resep.jumlah_porsi ? resep.jumlah_porsi.toLocaleString('id-ID') : ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\./g, '');
                              const numValue = parseInt(value) || 0;
                              updateResep(index, 'jumlah_porsi', numValue);
                            }}
                            required
                            placeholder="Jumlah Porsi"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeResep(index)}
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
                    {editingMenu ? 'Update' : 'Simpan'}
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

export default function MenuPage() {
  return (
    <ProtectedRoute>
      <MenuContent />
    </ProtectedRoute>
  );
}
