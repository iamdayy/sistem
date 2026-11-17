const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ResepBahan {
  bahan_id: number;
  jumlah: number;
  satuan: string;
  bahan?: {
    id: number;
    nama: string;
    harga_per_satuan: number;
  };
}

export interface Resep {
  id: number;
  nama: string;
  deskripsi?: string;
  cara_membuat?: string;
  porsi: number;
  waktu_persiapan: number;
  waktu_memasak: number;
  bahan: ResepBahan[];
}

export interface ResepResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: Resep[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
}

export interface ResepFormData {
  nama: string;
  deskripsi?: string;
  cara_membuat?: string;
  porsi: number;
  waktu_persiapan: number;
  waktu_memasak: number;
  bahan: {
    bahan_id: number;
    jumlah: number;
    satuan: string;
  }[];
}

export interface BiayaDetail {
  bahan: string;
  jumlah: number;
  satuan: string;
  harga_per_satuan: number;
  subtotal: number;
}

export interface BiayaResep {
  resep: string;
  porsi: number;
  detail_biaya: BiayaDetail[];
  total_biaya: number;
  biaya_per_porsi: number;
}

export const resepApi = {
  getAll: async (token: string, params?: {
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<ResepResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const response = await fetch(`${API_URL}/resep?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data resep');
    }

    return response.json();
  },

  getById: async (token: string, id: number): Promise<{ success: boolean; message: string; data: Resep }> => {
    const response = await fetch(`${API_URL}/resep/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data resep');
    }

    return response.json();
  },

  create: async (token: string, data: ResepFormData): Promise<{ success: boolean; message: string; data: Resep }> => {
    const response = await fetch(`${API_URL}/resep`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menambah resep');
    }

    return response.json();
  },

  update: async (token: string, id: number, data: ResepFormData): Promise<{ success: boolean; message: string; data: Resep }> => {
    const response = await fetch(`${API_URL}/resep/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengupdate resep');
    }

    return response.json();
  },

  delete: async (token: string, id: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_URL}/resep/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menghapus resep');
    }

    return response.json();
  },

  hitungBiaya: async (token: string, id: number): Promise<{ success: boolean; message: string; data: BiayaResep }> => {
    const response = await fetch(`${API_URL}/resep/${id}/hitung-biaya`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menghitung biaya');
    }

    return response.json();
  },
};
