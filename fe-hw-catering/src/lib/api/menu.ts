const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface MenuResep {
  id: number;
  nama: string;
  deskripsi?: string;
  cara_membuat?: string;
  porsi: number;
  waktu_persiapan: number;
  waktu_memasak: number;
  pivot: {
    menu_id: number;
    resep_id: number;
    jumlah_porsi: number;
  };
}

export interface Menu {
  id: number;
  nama: string;
  deskripsi?: string;
  harga: number;
  kategori: string;
  foto?: string;
  tersedia: boolean;
  resep: MenuResep[];
}

export interface MenuResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: Menu[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
}

export interface MenuFormData {
  nama: string;
  deskripsi?: string;
  harga: number;
  kategori: string;
  foto?: File;
  tersedia: boolean;
  resep: {
    resep_id: number;
    jumlah_porsi: number;
  }[];
}

export const menuApi = {
  getAll: async (token: string, params?: {
    search?: string;
    kategori?: string;
    tersedia?: boolean;
    per_page?: number;
    page?: number;
  }): Promise<MenuResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.kategori) queryParams.append('kategori', params.kategori);
    if (params?.tersedia !== undefined) queryParams.append('tersedia', params.tersedia ? '1' : '0');
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const response = await fetch(`${API_URL}/menu?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data menu');
    }

    return response.json();
  },

  getKategori: async (token: string): Promise<{ success: boolean; message: string; data: string[] }> => {
    const response = await fetch(`${API_URL}/menu/kategori`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil kategori');
    }

    return response.json();
  },

  getById: async (token: string, id: number): Promise<{ success: boolean; message: string; data: Menu }> => {
    const response = await fetch(`${API_URL}/menu/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data menu');
    }

    return response.json();
  },

  create: async (token: string, data: MenuFormData): Promise<{ success: boolean; message: string; data: Menu }> => {
    const formData = new FormData();
    formData.append('nama', data.nama);
    if (data.deskripsi) formData.append('deskripsi', data.deskripsi);
    formData.append('harga', data.harga.toString());
    formData.append('kategori', data.kategori);
    formData.append('tersedia', data.tersedia ? '1' : '0');
    if (data.foto) formData.append('foto', data.foto);

    data.resep.forEach((resep, index) => {
      formData.append(`resep[${index}][resep_id]`, resep.resep_id.toString());
      formData.append(`resep[${index}][jumlah_porsi]`, resep.jumlah_porsi.toString());
    });

    const response = await fetch(`${API_URL}/menu`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menambah menu');
    }

    return response.json();
  },

  update: async (token: string, id: number, data: MenuFormData): Promise<{ success: boolean; message: string; data: Menu }> => {
    const formData = new FormData();
    formData.append('nama', data.nama);
    if (data.deskripsi) formData.append('deskripsi', data.deskripsi);
    formData.append('harga', data.harga.toString());
    formData.append('kategori', data.kategori);
    formData.append('tersedia', data.tersedia ? '1' : '0');
    if (data.foto) formData.append('foto', data.foto);

    data.resep.forEach((resep, index) => {
      formData.append(`resep[${index}][resep_id]`, resep.resep_id.toString());
      formData.append(`resep[${index}][jumlah_porsi]`, resep.jumlah_porsi.toString());
    });

    const response = await fetch(`${API_URL}/menu/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengupdate menu');
    }

    return response.json();
  },

  delete: async (token: string, id: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_URL}/menu/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menghapus menu');
    }

    return response.json();
  },

  toggleAvailability: async (token: string, id: number): Promise<{ success: boolean; message: string; data: Menu }> => {
    const response = await fetch(`${API_URL}/menu/${id}/toggle-availability`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengubah ketersediaan');
    }

    return response.json();
  },
};
