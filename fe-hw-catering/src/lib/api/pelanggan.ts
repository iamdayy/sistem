const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Pelanggan {
  id: number;
  nama: string;
  email: string;
  telepon: string;
  alamat?: string;
}

export interface PelangganResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: Pelanggan[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
}

export interface PelangganFormData {
  nama: string;
  email: string;
  telepon: string;
  alamat?: string;
}

export const pelangganApi = {
  getAll: async (token: string, params?: {
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<PelangganResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const response = await fetch(`${API_URL}/pelanggan?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data pelanggan');
    }

    return response.json();
  },

  getById: async (token: string, id: number): Promise<{ success: boolean; message: string; data: Pelanggan }> => {
    const response = await fetch(`${API_URL}/pelanggan/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data pelanggan');
    }

    return response.json();
  },

  create: async (token: string, data: PelangganFormData): Promise<{ success: boolean; message: string; data: Pelanggan }> => {
    const response = await fetch(`${API_URL}/pelanggan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menambah pelanggan');
    }

    return response.json();
  },

  update: async (token: string, id: number, data: PelangganFormData): Promise<{ success: boolean; message: string; data: Pelanggan }> => {
    const response = await fetch(`${API_URL}/pelanggan/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengupdate pelanggan');
    }

    return response.json();
  },

  delete: async (token: string, id: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_URL}/pelanggan/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menghapus pelanggan');
    }

    return response.json();
  },
};
