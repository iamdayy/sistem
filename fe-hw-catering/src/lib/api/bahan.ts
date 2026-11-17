const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Bahan {
  id: number;
  nama: string;
  satuan: string;
  harga_per_satuan: number;
}

export interface BahanResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: Bahan[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
}

export interface BahanFormData {
  nama: string;
  satuan: string;
  harga_per_satuan: number;
}

export const bahanApi = {
  getAll: async (token: string, params?: {
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<BahanResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const response = await fetch(`${API_URL}/bahan?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data bahan');
    }

    return response.json();
  },

  getById: async (token: string, id: number): Promise<{ success: boolean; message: string; data: Bahan }> => {
    const response = await fetch(`${API_URL}/bahan/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data bahan');
    }

    return response.json();
  },

  create: async (token: string, data: BahanFormData): Promise<{ success: boolean; message: string; data: Bahan }> => {
    const response = await fetch(`${API_URL}/bahan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menambah bahan');
    }

    return response.json();
  },

  update: async (token: string, id: number, data: Partial<BahanFormData>): Promise<{ success: boolean; message: string; data: Bahan }> => {
    const response = await fetch(`${API_URL}/bahan/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengupdate bahan');
    }

    return response.json();
  },

  delete: async (token: string, id: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_URL}/bahan/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menghapus bahan');
    }

    return response.json();
  },
};
