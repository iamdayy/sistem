const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type UserRole = 'admin' | 'staff';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: User[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
}

export const userApi = {
  getAll: async (token: string, params?: {
    search?: string;
    role?: UserRole;
    per_page?: number;
    page?: number;
  }): Promise<UserResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const response = await fetch(`${API_URL}/users?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data user');
    }

    return response.json();
  },

  getById: async (token: string, id: number): Promise<{ success: boolean; message: string; data: User }> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data user');
    }

    return response.json();
  },

  create: async (token: string, data: UserFormData): Promise<{ success: boolean; message: string; data: User }> => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menambah user');
    }

    return response.json();
  },

  update: async (token: string, id: number, data: UserUpdateData): Promise<{ success: boolean; message: string; data: User }> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengupdate user');
    }

    return response.json();
  },

  delete: async (token: string, id: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menghapus user');
    }

    return response.json();
  },
};
